import { eq, desc, and, or, sql, like } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface CreateCouponPayload {
	name: string;
	code: string;
	bannerImage?: string | null;
	discountType: 'percentage' | 'fixed';
	discountValue: number;
	minOrderAmount?: number;
	description?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	status?: 'publish' | 'draft' | 'trash';
	usageLimit?: number | null;
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {
	isActive?: boolean;
}

export interface CouponFilterOptions {
	status?: string;
	search?: string;
}

export class CouponService {
	private static isTableInitialized = false;

	/**
	 * Ensures the coupons table exists in Cloudflare D1
	 */
	static async ensureTable(db: DrizzleD1Database<typeof schema>) {
		if (this.isTableInitialized) return;
		try {
			await db.run(
				sql.raw(`
				CREATE TABLE IF NOT EXISTS coupons (
					id TEXT PRIMARY KEY,
					name TEXT NOT NULL DEFAULT 'Special Discount',
					code TEXT NOT NULL UNIQUE,
					banner_image TEXT,
					discount_type TEXT NOT NULL DEFAULT 'percentage',
					discount_value INTEGER NOT NULL,
					min_order_amount INTEGER DEFAULT 0,
					max_discount_amount INTEGER,
					description TEXT,
					start_date TEXT,
					end_date TEXT,
					status TEXT NOT NULL DEFAULT 'publish',
					usage_limit INTEGER,
					usage_count INTEGER NOT NULL DEFAULT 0,
					is_active INTEGER NOT NULL DEFAULT 1,
					created_at INTEGER NOT NULL,
					updated_at INTEGER NOT NULL
				);
			`)
			);
			this.isTableInitialized = true;
		} catch (e) {
			console.error('Failed to ensure coupons table:', e);
		}
	}

	/**
	 * Lists all coupons with tab counts and filters
	 */
	static async listCoupons(
		db: DrizzleD1Database<typeof schema>,
		options: CouponFilterOptions = {}
	) {
		await this.ensureTable(db);
		try {
			// Auto seed if empty
			const countRes = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.coupons)
				.all();
			const totalInDb = countRes[0]?.count ?? 0;

			if (totalInDb === 0) {
				await this.seedInitialCoupons(db);
			}

			// Get tab counts
			const allRows = await db
				.select()
				.from(schema.coupons)
				.orderBy(desc(schema.coupons.createdAt))
				.all();

			const counts = {
				all: allRows.filter((c) => c.status !== 'trash').length,
				publish: allRows.filter((c) => c.status === 'publish').length,
				draft: allRows.filter((c) => c.status === 'draft').length,
				trash: allRows.filter((c) => c.status === 'trash').length
			};

			// Apply filters
			let filtered = allRows;

			if (options.status && options.status !== 'all') {
				filtered = filtered.filter((c) => c.status === options.status);
			} else {
				// By default, exclude trashed items in "all"
				filtered = filtered.filter((c) => c.status !== 'trash');
			}

			if (options.search && options.search.trim()) {
				const term = options.search.trim().toLowerCase();
				filtered = filtered.filter(
					(c) =>
						c.name.toLowerCase().includes(term) ||
						c.code.toLowerCase().includes(term) ||
						(c.description && c.description.toLowerCase().includes(term))
				);
			}

			return {
				coupons: filtered,
				counts
			};
		} catch (e) {
			console.error('Error in CouponService.listCoupons:', e);
			return {
				coupons: [],
				counts: { all: 0, publish: 0, draft: 0, trash: 0 }
			};
		}
	}

	/**
	 * Get coupon by ID
	 */
	static async getCouponById(db: DrizzleD1Database<typeof schema>, id: string) {
		await this.ensureTable(db);
		try {
			return await db
				.select()
				.from(schema.coupons)
				.where(eq(schema.coupons.id, id))
				.get();
		} catch (e) {
			console.error('Failed to get coupon by id:', e);
			return null;
		}
	}

	/**
	 * Create a new coupon
	 */
	static async createCoupon(
		db: DrizzleD1Database<typeof schema>,
		payload: CreateCouponPayload
	) {
		await this.ensureTable(db);
		const cleanCode = payload.code.trim().toUpperCase();

		// Check for existing code
		const existing = await db
			.select()
			.from(schema.coupons)
			.where(eq(schema.coupons.code, cleanCode))
			.get();

		if (existing) {
			throw new Error(`কুপন কোড "${cleanCode}" ইতিমধ্যে ব্যবহৃত হচ্ছে!`);
		}

		const newCoupon: typeof schema.coupons.$inferInsert = {
			id: crypto.randomUUID(),
			name: payload.name.trim(),
			code: cleanCode,
			bannerImage: payload.bannerImage || null,
			discountType: payload.discountType || 'percentage',
			discountValue: Math.round(payload.discountValue),
			minOrderAmount: Math.round(payload.minOrderAmount || 0),
			description: payload.description?.trim() || null,
			startDate: payload.startDate || null,
			endDate: payload.endDate || null,
			status: payload.status || 'publish',
			usageLimit: payload.usageLimit || null,
			usageCount: 0,
			isActive: payload.status !== 'draft' && payload.status !== 'trash',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.insert(schema.coupons).values(newCoupon);
		return newCoupon;
	}

	/**
	 * Update an existing coupon
	 */
	static async updateCoupon(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		payload: UpdateCouponPayload
	) {
		await this.ensureTable(db);
		const updateData: Partial<typeof schema.coupons.$inferInsert> = {
			updatedAt: new Date()
		};

		if (payload.name !== undefined) updateData.name = payload.name.trim();
		if (payload.code !== undefined) {
			const cleanCode = payload.code.trim().toUpperCase();
			// Check if code taken by another coupon
			const existing = await db
				.select()
				.from(schema.coupons)
				.where(eq(schema.coupons.code, cleanCode))
				.get();
			if (existing && existing.id !== id) {
				throw new Error(`কুপন কোড "${cleanCode}" অন্য একটি কুপনে ব্যবহৃত হচ্ছে!`);
			}
			updateData.code = cleanCode;
		}
		if (payload.bannerImage !== undefined) updateData.bannerImage = payload.bannerImage;
		if (payload.discountType !== undefined) updateData.discountType = payload.discountType;
		if (payload.discountValue !== undefined) updateData.discountValue = Math.round(payload.discountValue);
		if (payload.minOrderAmount !== undefined) updateData.minOrderAmount = Math.round(payload.minOrderAmount);
		if (payload.description !== undefined) updateData.description = payload.description?.trim() || null;
		if (payload.startDate !== undefined) updateData.startDate = payload.startDate;
		if (payload.endDate !== undefined) updateData.endDate = payload.endDate;
		if (payload.status !== undefined) {
			updateData.status = payload.status;
			updateData.isActive = payload.status === 'publish';
		}
		if (payload.usageLimit !== undefined) updateData.usageLimit = payload.usageLimit;
		if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

		await db
			.update(schema.coupons)
			.set(updateData)
			.where(eq(schema.coupons.id, id));

		return { id, success: true };
	}

	/**
	 * Toggle status between publish and draft
	 */
	static async toggleStatus(db: DrizzleD1Database<typeof schema>, id: string) {
		await this.ensureTable(db);
		const current = await this.getCouponById(db, id);
		if (!current) throw new Error('কুপন পাওয়া যায়নি!');

		const nextStatus = current.status === 'publish' ? 'draft' : 'publish';
		await db
			.update(schema.coupons)
			.set({
				status: nextStatus,
				isActive: nextStatus === 'publish',
				updatedAt: new Date()
			})
			.where(eq(schema.coupons.id, id));

		return { id, status: nextStatus };
	}

	/**
	 * Move coupon to trash
	 */
	static async moveToTrash(db: DrizzleD1Database<typeof schema>, id: string) {
		await this.ensureTable(db);
		await db
			.update(schema.coupons)
			.set({
				status: 'trash',
				isActive: false,
				updatedAt: new Date()
			})
			.where(eq(schema.coupons.id, id));
		return { id, success: true };
	}

	/**
	 * Restore coupon from trash
	 */
	static async restore(db: DrizzleD1Database<typeof schema>, id: string) {
		await this.ensureTable(db);
		await db
			.update(schema.coupons)
			.set({
				status: 'publish',
				isActive: true,
				updatedAt: new Date()
			})
			.where(eq(schema.coupons.id, id));
		return { id, success: true };
	}

	/**
	 * Permanent delete
	 */
	static async permanentDelete(db: DrizzleD1Database<typeof schema>, id: string) {
		await this.ensureTable(db);
		await db.delete(schema.coupons).where(eq(schema.coupons.id, id));
		return { id, success: true };
	}

	/**
	 * Seeds initial realistic coupons
	 */
	static async seedInitialCoupons(db: DrizzleD1Database<typeof schema>) {
		const seeds: CreateCouponPayload[] = [
			{
				name: 'স্পেশাল লঞ্চ অফার ২০%',
				code: 'AURA20',
				discountType: 'percentage',
				discountValue: 20,
				minOrderAmount: 500,
				description: 'সব পণ্যের ওপর ২০% স্পেশাল লঞ্চ ডিসকাউন্ট।',
				startDate: '2026-10-01',
				endDate: '2026-11-30',
				status: 'publish'
			},
			{
				name: 'ভিআইপি মেম্বার ডিসকাউন্ট',
				code: 'VIP30',
				discountType: 'percentage',
				discountValue: 30,
				minOrderAmount: 1500,
				description: 'আমাদের প্রিমিয়াম ও ভিআইপি গ্রাহকদের জন্য ৩০% ডিসকাউন্ট।',
				startDate: '2026-10-15',
				endDate: '2026-12-31',
				status: 'publish'
			},
			{
				name: 'ফ্ল্যাট ১০০ টাকা ছাড়',
				code: 'SAVE100',
				discountType: 'fixed',
				discountValue: 100,
				minOrderAmount: 1000,
				description: '১০০০ টাকার বেশি অর্ডারে ফ্ল্যাট ১০০ টাকা ডিসকাউন্ট।',
				startDate: '2026-10-20',
				endDate: '2026-11-15',
				status: 'draft'
			}
		];

		for (const s of seeds) {
			try {
				await this.createCoupon(db, s);
			} catch (e) {
				// Ignore if already exists
			}
		}
	}
}

