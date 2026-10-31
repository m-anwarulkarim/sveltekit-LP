import { eq, desc, and, or, sql, like } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface CustomerUpsertPayload {
	phone: string;
	name: string;
	address: string;
	city?: string;
	district?: string;
	orderTotal?: number;
}

export interface SaveCustomerPayload {
	id?: string;
	name: string;
	phone: string;
	email?: string;
	address: string;
	city?: string;
	district?: string;
	riskLevel?: 'safe' | 'moderate' | 'high_risk';
	internalNotes?: string;
}

export interface ListCustomersOptions {
	search?: string;
	riskLevel?: 'all' | 'safe' | 'moderate' | 'high_risk';
	isBanned?: boolean;
	limit?: number;
	offset?: number;
}

/**
 * Enterprise Customer 360 & CRM Service (100% Real SQLite D1 Data)
 */
export class CustomerService {
	/**
	 * Lists customers with filtering, search, and live order sync
	 */
	static async listCustomers(
		db: DrizzleD1Database<typeof schema>,
		options: ListCustomersOptions = {}
	) {
		try {
			const conditions: any[] = [];

			if (options.riskLevel && options.riskLevel !== 'all') {
				conditions.push(eq(schema.customers.riskLevel, options.riskLevel));
			}

			if (options.isBanned !== undefined) {
				conditions.push(eq(schema.customers.isBanned, options.isBanned));
			}

			if (options.search && options.search.trim()) {
				const term = `%${options.search.trim().toLowerCase()}%`;
				conditions.push(
					or(
						like(schema.customers.name, term),
						like(schema.customers.phone, term),
						like(schema.customers.address, term),
						like(schema.customers.city, term),
						like(schema.customers.email, term)
					)
				);
			}

			let query = db.select().from(schema.customers);

			if (conditions.length > 0) {
				query = query.where(and(...conditions)) as any;
			}

			query = query.orderBy(desc(schema.customers.totalSpent), desc(schema.customers.totalOrders)) as any;

			if (options.limit) {
				query = query.limit(options.limit) as any;
			}

			if (options.offset) {
				query = query.offset(options.offset) as any;
			}

			let rows = await query.all();

			// If customer table is empty, auto-sync from real orders table
			if (rows.length === 0 && !options.search && (!options.riskLevel || options.riskLevel === 'all')) {
				await CustomerService.syncFromRealOrders(db);
				rows = await query.all();
			}

			return rows.map((c) => ({
				id: c.id,
				name: c.name,
				phone: c.phone,
				email: c.email || '',
				address: c.address,
				city: c.city || 'ঢাকা',
				district: c.district || 'ঢাকা',
				totalOrders: c.totalOrders ?? 0,
				deliveredOrders: c.deliveredOrders ?? 0,
				cancelledOrders: c.cancelledOrders ?? 0,
				returnedOrders: c.returnedOrders ?? 0,
				totalSpent: c.totalSpent ?? 0,
				successRate: c.successRate ?? 100,
				riskLevel: (c.riskLevel || 'safe') as 'safe' | 'moderate' | 'high_risk',
				isBanned: Boolean(c.isBanned),
				banReason: c.banReason,
				internalNotes: c.internalNotes || '',
				createdAt: c.createdAt,
				updatedAt: c.updatedAt
			}));
		} catch (error) {
			console.error('Error in CustomerService.listCustomers:', error);
			return [];
		}
	}

	/**
	 * Total count of registered customers
	 */
	static async countCustomers(db: DrizzleD1Database<typeof schema>): Promise<number> {
		try {
			const res = await db.select({ count: sql<number>`count(*)` }).from(schema.customers).get();
			let count = res?.count ?? 0;
			if (count === 0) {
				await CustomerService.syncFromRealOrders(db);
				const reRes = await db.select({ count: sql<number>`count(*)` }).from(schema.customers).get();
				return reRes?.count ?? 0;
			}
			return count;
		} catch (error) {
			console.error('Error counting customers:', error);
			return 0;
		}
	}

	/**
	 * Finds existing customer by phone or creates a new profile with 0 stats
	 */
	static async getOrCreateCustomer(db: DrizzleD1Database<typeof schema>, payload: CustomerUpsertPayload) {
		const existing = await db
			.select()
			.from(schema.customers)
			.where(eq(schema.customers.phone, payload.phone))
			.get();

		if (existing) {
			await db
				.update(schema.customers)
				.set({
					name: payload.name || existing.name,
					address: payload.address || existing.address,
					city: payload.city || existing.city,
					district: payload.district || existing.district,
					updatedAt: new Date()
				})
				.where(eq(schema.customers.id, existing.id));

			return existing;
		}

		const newCustomer: typeof schema.customers.$inferInsert = {
			id: crypto.randomUUID(),
			phone: payload.phone,
			name: payload.name,
			address: payload.address,
			city: payload.city || 'ঢাকা',
			district: payload.district || 'ঢাকা',
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
		};

		await db.insert(schema.customers).values(newCustomer);
		return newCustomer;
	}

	/**
	 * Increments customer lifetime stats upon a placed/confirmed order
	 */
	static async incrementCustomerOrderStats(
		db: DrizzleD1Database<typeof schema>,
		customerId: string,
		orderTotal: number
	) {
		const customer = await db
			.select()
			.from(schema.customers)
			.where(eq(schema.customers.id, customerId))
			.get();

		if (!customer) return;

		const updatedTotalOrders = (customer.totalOrders || 0) + 1;
		const updatedTotalSpent = (customer.totalSpent || 0) + orderTotal;

		await db
			.update(schema.customers)
			.set({
				totalOrders: updatedTotalOrders,
				totalSpent: updatedTotalSpent,
				updatedAt: new Date()
			})
			.where(eq(schema.customers.id, customerId));
	}

	/**
	 * Create or Update a customer profile
	 */
	static async saveCustomer(db: DrizzleD1Database<typeof schema>, payload: SaveCustomerPayload) {
		const cleanPhone = payload.phone.trim();
		const cleanName = payload.name.trim();
		const cleanAddress = payload.address.trim();
		const cleanEmail = payload.email?.trim() || null;
		const cleanCity = payload.city?.trim() || 'ঢাকা';
		const cleanDistrict = payload.district?.trim() || cleanCity;
		const riskLevel = payload.riskLevel || 'safe';
		const internalNotes = payload.internalNotes?.trim() || null;

		if (payload.id) {
			// Update existing customer
			const existing = await db
				.select()
				.from(schema.customers)
				.where(eq(schema.customers.id, payload.id))
				.get();

			if (!existing) {
				throw new Error('গ্রাহক পাওয়া যায়নি!');
			}

			// Check if phone changed and belongs to someone else
			if (cleanPhone !== existing.phone) {
				const phoneCheck = await db
					.select({ id: schema.customers.id })
					.from(schema.customers)
					.where(eq(schema.customers.phone, cleanPhone))
					.get();

				if (phoneCheck && phoneCheck.id !== payload.id) {
					throw new Error('এই মোবাইল নম্বরটি অন্য একজন গ্রাহকের প্রোফাইলে ইতোমধ্যে ব্যবহৃত হয়েছে!');
				}
			}

			await db
				.update(schema.customers)
				.set({
					name: cleanName,
					phone: cleanPhone,
					email: cleanEmail,
					address: cleanAddress,
					city: cleanCity,
					district: cleanDistrict,
					riskLevel,
					internalNotes,
					updatedAt: new Date()
				})
				.where(eq(schema.customers.id, payload.id));

			return { id: payload.id, success: true };
		} else {
			// Check duplicate phone
			const existingPhone = await db
				.select({ id: schema.customers.id })
				.from(schema.customers)
				.where(eq(schema.customers.phone, cleanPhone))
				.get();

			if (existingPhone) {
				throw new Error('এই মোবাইল নম্বর দিয়ে ইতোমধ্যে একজন গ্রাহক নিবন্ধিত রয়েছেন!');
			}

			const newId = crypto.randomUUID();
			await db.insert(schema.customers).values({
				id: newId,
				name: cleanName,
				phone: cleanPhone,
				email: cleanEmail,
				address: cleanAddress,
				city: cleanCity,
				district: cleanDistrict,
				totalOrders: 0,
				deliveredOrders: 0,
				cancelledOrders: 0,
				returnedOrders: 0,
				totalSpent: 0,
				successRate: 100,
				riskLevel,
				isBanned: false,
				internalNotes,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			return { id: newId, success: true };
		}
	}

	/**
	 * Permanently delete a customer record
	 */
	static async deleteCustomer(db: DrizzleD1Database<typeof schema>, id: string) {
		const existing = await db
			.select()
			.from(schema.customers)
			.where(eq(schema.customers.id, id))
			.get();

		if (!existing) {
			throw new Error('গ্রাহক খুঁজে পাওয়া যায়নি!');
		}

		await db.delete(schema.customers).where(eq(schema.customers.id, id));
		return { success: true };
	}

	/**
	 * Toggle ban / blacklist status of a customer
	 */
	static async toggleBanCustomer(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		banReason?: string
	) {
		const customer = await db
			.select()
			.from(schema.customers)
			.where(eq(schema.customers.id, id))
			.get();

		if (!customer) throw new Error('গ্রাহক খুঁজে পাওয়া যায়নি!');

		const newBannedState = !customer.isBanned;

		await db
			.update(schema.customers)
			.set({
				isBanned: newBannedState,
				banReason: newBannedState ? (banReason || 'নিরাপত্তা বিবেচনায় অ্যাডমিন কর্তৃক ব্যান করা হয়েছে') : null,
				updatedAt: new Date()
			})
			.where(eq(schema.customers.id, id));

		return { id, isBanned: newBannedState };
	}

	/**
	 * Update risk level
	 */
	static async updateRiskLevel(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		riskLevel: 'safe' | 'moderate' | 'high_risk'
	) {
		await db
			.update(schema.customers)
			.set({ riskLevel, updatedAt: new Date() })
			.where(eq(schema.customers.id, id));
		return { id, riskLevel, success: true };
	}

	/**
	 * Update internal staff notes
	 */
	static async updateInternalNotes(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		notes: string
	) {
		await db
			.update(schema.customers)
			.set({ internalNotes: notes, updatedAt: new Date() })
			.where(eq(schema.customers.id, id));
		return { id, success: true };
	}

	/**
	 * Returns real orders placed by this customer (by phone or customerId)
	 */
	static async getCustomerOrders(db: DrizzleD1Database<typeof schema>, phoneOrId: string) {
		try {
			const clean = phoneOrId.trim();
			const orders = await db
				.select()
				.from(schema.orders)
				.where(
					or(
						eq(schema.orders.customerPhone, clean),
						eq(schema.orders.customerId, clean)
					)
				)
				.orderBy(desc(schema.orders.createdAt))
				.all();

			return orders.map((o) => ({
				id: o.id,
				orderNumber: o.orderNumber,
				customerName: o.customerName,
				customerPhone: o.customerPhone,
				shippingAddress: o.shippingAddress,
				status: o.status,
				total: o.total,
				items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items,
				trackingCode: o.trackingCode,
				courierProvider: o.courierProvider,
				createdAt: o.createdAt
			}));
		} catch (error) {
			console.error('Error in CustomerService.getCustomerOrders:', error);
			return [];
		}
	}

	/**
	 * Scans real orders table and syncs customer profiles + real lifetime stats
	 */
	static async syncFromRealOrders(db: DrizzleD1Database<typeof schema>) {
		try {
			const allOrders = await db
				.select()
				.from(schema.orders)
				.where(eq(schema.orders.isTrashed, false))
				.orderBy(desc(schema.orders.createdAt))
				.all();

			if (!allOrders || allOrders.length === 0) return 0;

			// Group orders by customerPhone
			const customerMap = new Map<string, typeof allOrders>();
			for (const order of allOrders) {
				const phone = (order.customerPhone || '').trim();
				if (!phone) continue;
				if (!customerMap.has(phone)) {
					customerMap.set(phone, []);
				}
				customerMap.get(phone)!.push(order);
			}

			let syncedCount = 0;

			for (const [phone, orders] of customerMap.entries()) {
				const latestOrder = orders[0];
				const totalOrders = orders.length;
				const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
				const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
				const returnedOrders = orders.filter((o) => o.status === 'returned').length;

				// Calculate total spent on non-cancelled, non-returned orders
				const totalSpent = orders
					.filter((o) => !['cancelled'].includes(o.status))
					.reduce((sum, o) => sum + (o.total || 0), 0);

				// Delivery success rate
				const completedCount = deliveredOrders + cancelledOrders + returnedOrders;
				const successRate =
					completedCount > 0
						? Math.round((deliveredOrders / completedCount) * 100)
						: 100;

				const existing = await db
					.select()
					.from(schema.customers)
					.where(eq(schema.customers.phone, phone))
					.get();

				if (existing) {
					await db
						.update(schema.customers)
						.set({
							name: existing.name || latestOrder.customerName || 'গ্রাহক',
							address: existing.address || latestOrder.shippingAddress || 'ঢাকা',
							city: existing.city || (latestOrder.deliveryArea === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'),
							totalOrders,
							deliveredOrders,
							cancelledOrders,
							returnedOrders,
							totalSpent,
							successRate,
							updatedAt: new Date()
						})
						.where(eq(schema.customers.id, existing.id));
				} else {
					await db.insert(schema.customers).values({
						id: crypto.randomUUID(),
						phone,
						name: latestOrder.customerName || 'গ্রাহক',
						email: latestOrder.customerEmail || null,
						address: latestOrder.shippingAddress || 'ঢাকা',
						city: latestOrder.deliveryArea === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে',
						district: 'ঢাকা',
						totalOrders,
						deliveredOrders,
						cancelledOrders,
						returnedOrders,
						totalSpent,
						successRate,
						riskLevel: 'safe',
						isBanned: false,
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}
				syncedCount++;
			}

			return syncedCount;
		} catch (error) {
			console.error('Error syncing customers from orders:', error);
			return 0;
		}
	}

	/**
	 * List newsletter subscribers
	 */
	static async listNewsletter(db: DrizzleD1Database<typeof schema>) {
		try {
			const rows = await db.select().from(schema.newsletter).orderBy(desc(schema.newsletter.createdAt)).all();
			return rows;
		} catch (error) {
			console.error('Error fetching newsletter subscribers:', error);
			return [];
		}
	}

	/**
	 * Delete a newsletter subscriber
	 */
	static async deleteNewsletter(db: DrizzleD1Database<typeof schema>, id: string) {
		try {
			await db.delete(schema.newsletter).where(eq(schema.newsletter.id, id));
			return { success: true };
		} catch (error) {
			console.error('Error deleting newsletter subscriber:', error);
			throw error;
		}
	}
}
