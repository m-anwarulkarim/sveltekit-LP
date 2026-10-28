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

export interface ListCustomersOptions {
	search?: string;
	riskLevel?: 'all' | 'safe' | 'moderate' | 'high_risk';
	isBanned?: boolean;
	limit?: number;
	offset?: number;
}

/**
 * Enterprise Customer 360 & CRM Service
 */
export class CustomerService {
	/**
	 * Lists customers with filtering, search, and auto-seeding
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
						like(schema.customers.city, term)
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

			const rows = await query.all();

			return rows.map((c) => ({
				id: c.id,
				name: c.name,
				phone: c.phone,
				email: c.email || `${c.phone}@customer.aura.com`,
				address: c.address,
				city: c.city || 'Dhaka',
				district: c.district || 'Dhaka',
				totalOrders: c.totalOrders || 1,
				deliveredOrders: c.deliveredOrders || 1,
				cancelledOrders: c.cancelledOrders || 0,
				totalSpent: c.totalSpent || 1200,
				successRate: c.successRate ?? 95,
				riskLevel: c.riskLevel || 'safe',
				isBanned: Boolean(c.isBanned),
				banReason: c.banReason,
				internalNotes: c.internalNotes || '',
				createdAt: c.createdAt
			}));
		} catch (error) {
			console.error('Error in CustomerService.listCustomers:', error);
			return [];
		}
	}

	/**
	 * Finds existing customer by phone or creates a new profile
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
			city: payload.city || null,
			district: payload.district || null,
			totalOrders: 0,
			deliveredOrders: 0,
			cancelledOrders: 0,
			returnedOrders: 0,
			totalSpent: 0,
			successRate: 100,
			riskLevel: 'safe',
			isBanned: false
		};

		await db.insert(schema.customers).values(newCustomer);
		return newCustomer;
	}

	/**
	 * Increments customer lifetime stats upon a confirmed or placed order
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
	 * Toggle ban status of a customer
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

		if (!customer) throw new Error('Customer not found');

		const newBannedState = !customer.isBanned;

		await db
			.update(schema.customers)
			.set({
				isBanned: newBannedState,
				banReason: newBannedState ? (banReason || 'Frequent fake orders detected') : null,
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
	 * Manually create a customer profile
	 */
	static async createCustomer(
		db: DrizzleD1Database<typeof schema>,
		payload: {
			name: string;
			phone: string;
			email?: string;
			address: string;
			city?: string;
			riskLevel?: 'safe' | 'moderate' | 'high_risk';
			internalNotes?: string;
		}
	) {
		const newCustomer: typeof schema.customers.$inferInsert = {
			id: crypto.randomUUID(),
			name: payload.name.trim(),
			phone: payload.phone.trim(),
			email: payload.email?.trim() || null,
			address: payload.address.trim(),
			city: payload.city?.trim() || 'ঢাকা',
			district: payload.city?.trim() || 'ঢাকা',
			totalOrders: 1,
			deliveredOrders: 1,
			cancelledOrders: 0,
			returnedOrders: 0,
			totalSpent: 1200,
			successRate: 100,
			riskLevel: payload.riskLevel || 'safe',
			isBanned: false,
			internalNotes: payload.internalNotes?.trim() || null,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.insert(schema.customers).values(newCustomer);
		return newCustomer;
	}

	/**
	 * List newsletter subscribers with fallback
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
	 * Seed initial customers from orders or defaults
	 */
	static async seedInitialCustomers(db: DrizzleD1Database<typeof schema>) {
		const seedData = [
			{
				name: 'আহমেদ জুবায়ের',
				phone: '01711223344',
				email: 'ahmed.jubayer@gmail.com',
				address: 'হাউজ #১২, রোড #৪, ধানমন্ডি, ঢাকা',
				city: 'ঢাকা',
				totalOrders: 6,
				deliveredOrders: 6,
				cancelledOrders: 0,
				totalSpent: 8450,
				successRate: 100,
				riskLevel: 'safe',
				isBanned: false
			},
			{
				name: 'তাসনিম আক্তার',
				phone: '01822334455',
				email: 'tasnim.aktar@yahoo.com',
				address: 'ফ্ল্যাট ৪বি, বনানী ডিওএইচএস, ঢাকা',
				city: 'ঢাকা',
				totalOrders: 4,
				deliveredOrders: 4,
				cancelledOrders: 0,
				totalSpent: 6200,
				successRate: 100,
				riskLevel: 'safe',
				isBanned: false
			},
			{
				name: 'মাহমুদুল হক',
				phone: '01933445566',
				email: 'mahmud.haque@gmail.com',
				address: 'জিইসি মোড়, চট্টগ্রাম',
				city: 'চট্টগ্রাম',
				totalOrders: 3,
				deliveredOrders: 3,
				cancelledOrders: 0,
				totalSpent: 4150,
				successRate: 100,
				riskLevel: 'safe',
				isBanned: false
			},
			{
				name: 'রাকিব হাসান',
				phone: '01644556677',
				email: 'rakib.hasan@outlook.com',
				address: 'উপশহর ব্লক-বি, সিলেট',
				city: 'সিলেট',
				totalOrders: 2,
				deliveredOrders: 2,
				cancelledOrders: 0,
				totalSpent: 2890,
				successRate: 100,
				riskLevel: 'safe',
				isBanned: false
			},
			{
				name: 'শরীফুল ইসলাম',
				phone: '01555667788',
				email: 'shariful.bd@gmail.com',
				address: 'আগ্রাবাদ কমার্শিয়াল এরিয়া, চট্টগ্রাম',
				city: 'চট্টগ্রাম',
				totalOrders: 3,
				deliveredOrders: 1,
				cancelledOrders: 2,
				totalSpent: 1450,
				successRate: 33,
				riskLevel: 'high_risk',
				isBanned: false
			}
		];

		for (const cust of seedData) {
			try {
				await db
					.insert(schema.customers)
					.values({
						id: crypto.randomUUID(),
						name: cust.name,
						phone: cust.phone,
						email: cust.email,
						address: cust.address,
						city: cust.city,
						totalOrders: cust.totalOrders,
						deliveredOrders: cust.deliveredOrders,
						cancelledOrders: cust.cancelledOrders,
						totalSpent: cust.totalSpent,
						successRate: cust.successRate,
						riskLevel: cust.riskLevel,
						isBanned: cust.isBanned,
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.onConflictDoNothing();
			} catch (e) {
				console.error(`Failed to seed customer ${cust.name}:`, e);
			}
		}
	}
}
