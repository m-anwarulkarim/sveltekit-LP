import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, or, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/auth/login');
	}

	const user = event.locals.user;
	let userOrders: any[] = [];
	let customerProfile: any = null;

	try {
		const db = getDb(event.platform);
		if (db) {
			// 1. Fetch customer profile from customers table
			if (user.email) {
				customerProfile = await db
					.select()
					.from(schema.customers)
					.where(eq(schema.customers.email, user.email))
					.get()
					.catch(() => null);
			}

			// 2. Fetch all orders belonging to this user
			const conditions = [];
			if (user.id) {
				conditions.push(eq(schema.orders.userId, user.id));
			}
			if (user.email) {
				conditions.push(eq(schema.orders.customerEmail, user.email));
			}
			if (customerProfile?.phone) {
				conditions.push(eq(schema.orders.customerPhone, customerProfile.phone));
			}

			if (conditions.length > 0) {
				userOrders = await db
					.select()
					.from(schema.orders)
					.where(conditions.length === 1 ? conditions[0] : or(...conditions))
					.orderBy(desc(schema.orders.createdAt))
					.all()
					.catch(() => []);
			}

			// 3. If customer table has no record yet, build one from latest order
			if (!customerProfile && userOrders.length > 0) {
				const latest = userOrders[0];
				customerProfile = {
					name: latest.customerName || user.name,
					email: user.email,
					phone: latest.customerPhone || '',
					address: latest.shippingAddress || '',
					city: latest.deliveryArea === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে',
					district: latest.deliveryArea === 'inside_dhaka' ? 'ঢাকা' : 'অন্যান্য'
				};
			}
		}
	} catch (err) {
		console.error('Failed to load user orders:', err);
	}

	return {
		user,
		customer: customerProfile,
		orders: userOrders
	};
};

export const actions: Actions = {
	updateProfile: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: 'অনুগ্রহ করে প্রথমে লগইন করুন।' });
		}

		const user = event.locals.user;
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString()?.trim() || '';
		const phone = formData.get('phone')?.toString()?.trim() || '';

		if (!name) {
			return fail(400, { message: 'নামের ঘর ফাঁকা রাখা যাবে না।' });
		}

		try {
			const db = getDb(event.platform);
			if (db) {
				// Update user table
				await db
					.update(schema.user)
					.set({ name, updatedAt: new Date() })
					.where(eq(schema.user.id, user.id));

				// Update or insert into customers table
				if (user.email) {
					const existing = await db
						.select()
						.from(schema.customers)
						.where(eq(schema.customers.email, user.email))
						.get();

					if (existing) {
						await db
							.update(schema.customers)
							.set({
								name,
								phone: phone || existing.phone,
								updatedAt: new Date()
							})
							.where(eq(schema.customers.id, existing.id));
					} else if (phone) {
						await db.insert(schema.customers).values({
							id: crypto.randomUUID(),
							name,
							phone,
							email: user.email,
							address: 'ঢাকা',
							city: 'ঢাকা',
							district: 'ঢাকা',
							createdAt: new Date(),
							updatedAt: new Date()
						});
					}
				}
			}
			return { success: true, message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' };
		} catch (e: any) {
			console.error('Failed to update customer profile:', e);
			return fail(500, { message: 'সার্ভারে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।' });
		}
	},

	saveAddress: async (event) => {
		if (!event.locals.user) {
			return fail(401, { message: 'অনুগ্রহ করে প্রথমে লগইন করুন।' });
		}

		const user = event.locals.user;
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString()?.trim() || user.name;
		const phone = formData.get('phone')?.toString()?.trim() || '';
		const address = formData.get('address')?.toString()?.trim() || '';
		const city = formData.get('city')?.toString()?.trim() || 'ঢাকা';
		const district = formData.get('district')?.toString()?.trim() || 'ঢাকা';

		if (!address || !phone) {
			return fail(400, { message: 'মোবাইল নম্বর ও ডেলিভারি ঠিকানা আবশ্যক।' });
		}

		try {
			const db = getDb(event.platform);
			if (db && user.email) {
				const existing = await db
					.select()
					.from(schema.customers)
					.where(eq(schema.customers.email, user.email))
					.get();

				if (existing) {
					await db
						.update(schema.customers)
						.set({
							name,
							phone,
							address,
							city,
							district,
							updatedAt: new Date()
						})
						.where(eq(schema.customers.id, existing.id));
				} else {
					await db.insert(schema.customers).values({
						id: crypto.randomUUID(),
						name,
						phone,
						email: user.email,
						address,
						city,
						district,
						totalOrders: 0,
						deliveredOrders: 0,
						cancelledOrders: 0,
						returnedOrders: 0,
						totalSpent: 0,
						successRate: 100,
						riskLevel: 'safe',
						isBanned: false,
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}
			}
			return { success: true, message: 'ডেলিভারি ঠিকানা সফলভাবে সংরক্ষিত হয়েছে!' };
		} catch (e: any) {
			console.error('Failed to save customer address:', e);
			return fail(500, { message: 'ঠিকানা সংরক্ষণে সমস্যা হয়েছে।' });
		}
	},

	changePassword: async (event) => {
		const { auth } = event.locals;
		if (!auth || !event.locals.user) {
			return fail(500, { message: 'সার্ভার সেবা সাময়িকভাবে অনুপলব্ধ।' });
		}

		const formData = await event.request.formData();
		const currentPassword = formData.get('currentPassword')?.toString() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (!currentPassword || !newPassword) {
			return fail(400, { message: 'বর্তমান ও নতুন পাসওয়ার্ড প্রদান করুন।' });
		}

		if (newPassword.length < 6) {
			return fail(400, { message: 'পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { message: 'উভয় নতুন পাসওয়ার্ড একই হতে হবে।' });
		}

		try {
			await auth.api.changePassword({
				body: {
					currentPassword,
					newPassword,
					revokeOtherSessions: false
				},
				headers: event.request.headers
			});
			return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' };
		} catch (error: any) {
			console.error('Password change error:', error);
			const msg = String(error?.message || '').toLowerCase();
			if (msg.includes('current') || msg.includes('invalid') || msg.includes('password')) {
				return fail(400, { message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' });
			}
			return fail(400, { message: 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।' });
		}
	}
};
