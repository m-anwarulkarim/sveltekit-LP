import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { CustomerService } from '#lib/server/services/customer.service';
import { fail } from '@sveltejs/kit';

export interface CustomerItem {
	id: string;
	name: string;
	phone: string;
	email: string;
	address: string;
	city: string;
	district: string;
	totalOrders: number;
	deliveredOrders: number;
	cancelledOrders: number;
	returnedOrders: number;
	totalSpent: number;
	successRate: number;
	riskLevel: 'safe' | 'moderate' | 'high_risk';
	isBanned: boolean;
	banReason: string | null;
	internalNotes: string;
	createdAt: Date | string | number | null;
	updatedAt: Date | string | number | null;
}

export const load: PageServerLoad = async ({ parent, platform, url }) => {
	const parentData = await parent();
	const searchQuery = url.searchParams.get('q') || '';
	const riskFilter = (url.searchParams.get('risk') as 'all' | 'safe' | 'moderate' | 'high_risk') || 'all';

	let customers: CustomerItem[] = [];
	let newsletterSubscribers: any[] = [];

	try {
		const db = getDb(platform);
		const dbCustomers = await CustomerService.listCustomers(db, {
			search: searchQuery,
			riskLevel: riskFilter !== 'all' ? riskFilter : undefined
		});

		if (dbCustomers) {
			customers = dbCustomers as any;
		}

		const dbNewsletters = await CustomerService.listNewsletter(db);
		if (dbNewsletters) {
			newsletterSubscribers = dbNewsletters.map((n) => ({
				id: n.id,
				email: n.email,
				createdAt: typeof n.createdAt === 'number' ? new Date(n.createdAt).toISOString() : String(n.createdAt)
			}));
		}
	} catch (error) {
		console.error('Failed to load customers from D1:', error);
	}

	// Compute telemetry metrics from real data
	const totalCustomers = customers.length;
	const vipCustomers = customers.filter((c) => c.totalSpent >= 5000 || c.totalOrders >= 4).length;
	const highRiskCount = customers.filter((c) => c.riskLevel === 'high_risk' || c.isBanned).length;
	const totalSpentAll = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
	const totalOrdersAll = customers.reduce((acc, c) => acc + (c.totalOrders || 0), 0);

	return {
		...parentData,
		customers,
		newsletter: newsletterSubscribers,
		telemetry: {
			totalCustomers,
			vipCustomers,
			highRiskCount,
			totalSpentAll,
			totalOrdersAll,
			avgSpentPerCustomer: totalCustomers > 0 ? Math.round(totalSpentAll / totalCustomers) : 0
		},
		searchQuery,
		riskFilter
	};
};

export const actions: Actions = {
	// Create or Edit Customer
	saveCustomer: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim() || undefined;
		const name = data.get('name')?.toString()?.trim();
		const phone = data.get('phone')?.toString()?.trim();
		const email = data.get('email')?.toString()?.trim() || undefined;
		const address = data.get('address')?.toString()?.trim();
		const city = data.get('city')?.toString()?.trim() || 'ঢাকা';
		const district = data.get('district')?.toString()?.trim() || city;
		const riskLevel = (data.get('riskLevel')?.toString()?.trim() as 'safe' | 'moderate' | 'high_risk') || 'safe';
		const internalNotes = data.get('internalNotes')?.toString()?.trim() || undefined;

		if (!name || !phone || !address) {
			return fail(400, { success: false, message: 'নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করা বাধ্যতামূলক!' });
		}

		try {
			const db = getDb(platform);
			await CustomerService.saveCustomer(db, {
				id,
				name,
				phone,
				email,
				address,
				city,
				district,
				riskLevel,
				internalNotes
			});

			return {
				success: true,
				message: id ? 'গ্রাহকের তথ্য সফলভাবে আপডেট হয়েছে!' : 'নতুন গ্রাহক সফলভাবে যুক্ত করা হয়েছে!'
			};
		} catch (error: any) {
			console.error('Failed to save customer in D1:', error);
			return fail(400, { success: false, message: error?.message || 'তথ্য সংরক্ষণে ব্যর্থ হয়েছে!' });
		}
	},

	// Delete Customer
	deleteCustomer: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();

		if (!id) {
			return fail(400, { success: false, message: 'গ্রাহকের আইডি পাওয়া যায়নি!' });
		}

		try {
			const db = getDb(platform);
			await CustomerService.deleteCustomer(db, id);
			return { success: true, message: 'গ্রাহক রেকর্ড সফলভাবে মুছে ফেলা হয়েছে!' };
		} catch (error: any) {
			console.error('Failed to delete customer in D1:', error);
			return fail(500, { success: false, message: error?.message || 'গ্রাহক ডিলিট করতে সমস্যা হয়েছে!' });
		}
	},

	// Toggle Ban / Blacklist
	toggleBan: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();
		const banReason =
			data.get('banReason')?.toString()?.trim() || 'নিরাপত্তা বিবেচনায় অ্যাডমিন কর্তৃক ব্যান করা হয়েছে';

		if (!id) {
			return fail(400, { success: false, message: 'গ্রাহকের আইডি পাওয়া যায়নি!' });
		}

		try {
			const db = getDb(platform);
			const res = await CustomerService.toggleBanCustomer(db, id, banReason);
			const statusText = res.isBanned ? 'ব্যান (ব্ল্যাকলিস্ট)' : 'আনব্যান (সক্রিয়)';
			return { success: true, message: `গ্রাহককে সফলভাবে ${statusText} করা হয়েছে!` };
		} catch (error: any) {
			console.error('Failed to toggle ban in D1:', error);
			return fail(500, { success: false, message: error?.message || 'ব্যান স্ট্যাটাস পরিবর্তনে ত্রুটি হয়েছে!' });
		}
	},

	// Update Risk Level
	updateRisk: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();
		const riskLevel = data.get('riskLevel')?.toString()?.trim() as 'safe' | 'moderate' | 'high_risk';

		if (!id || !riskLevel) {
			return fail(400, { success: false, message: 'সঠিক তথ্য প্রদান করুন!' });
		}

		try {
			const db = getDb(platform);
			await CustomerService.updateRiskLevel(db, id, riskLevel);
			return { success: true, message: 'রিস্ক লেভেল সফলভাবে আপডেট হয়েছে!' };
		} catch (error: any) {
			console.error('Failed to update risk in D1:', error);
			return fail(500, { success: false, message: error?.message || 'রিস্ক লেভেল পরিবর্তনে ত্রুটি হয়েছে!' });
		}
	},

	// Update Internal Notes
	updateNotes: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();
		const internalNotes =
			data.get('internalNotes')?.toString()?.trim() ?? data.get('notes')?.toString()?.trim() ?? '';

		if (!id) {
			return fail(400, { success: false, message: 'গ্রাহকের আইডি পাওয়া যায়নি!' });
		}

		try {
			const db = getDb(platform);
			await CustomerService.updateInternalNotes(db, id, internalNotes);
			return { success: true, message: 'অভ্যন্তরীণ নোট সফলভাবে সংরক্ষণ করা হয়েছে!' };
		} catch (error: any) {
			console.error('Failed to save notes in D1:', error);
			return fail(500, { success: false, message: error?.message || 'নোট সংরক্ষণে সমস্যা হয়েছে!' });
		}
	},

	// Sync Customers from Real Orders
	syncOrders: async ({ platform }) => {
		try {
			const db = getDb(platform);
			const count = await CustomerService.syncFromRealOrders(db);
			return {
				success: true,
				message: `রিয়েল অর্ডার থেকে ${count} জন গ্রাহকের তথ্য সফলভাবে সিঙ্ক ও আপডেট করা হয়েছে!`
			};
		} catch (error: any) {
			console.error('Failed to sync customers from orders:', error);
			return fail(500, { success: false, message: error?.message || 'অর্ডার সিঙ্কে সমস্যা হয়েছে!' });
		}
	},

	// Delete Newsletter Subscriber
	deleteNewsletter: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();

		if (!id) {
			return fail(400, { success: false, message: 'আইডি পাওয়া যায়নি!' });
		}

		try {
			const db = getDb(platform);
			await CustomerService.deleteNewsletter(db, id);
			return { success: true, message: 'নিউজলেটার সাবস্ক্রাইবার সফলভাবে মুছে ফেলা হয়েছে!' };
		} catch (error: any) {
			console.error('Failed to delete newsletter in D1:', error);
			return fail(500, { success: false, message: error?.message || 'ডিলিট করতে সমস্যা হয়েছে!' });
		}
	}
};
