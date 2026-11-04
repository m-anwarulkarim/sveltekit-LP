import { eq, desc, sql, and, like, or, inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface CreateReviewInput {
	productId: string;
	author: string;
	role?: string;
	rating: number;
	title?: string;
	content: string;
	verified?: boolean;
	phone?: string;
}

export interface ListReviewsOptions {
	status?: ReviewStatus | 'all';
	search?: string;
	rating?: number;
	productId?: string;
	featured?: boolean;
	limit: number;
	offset: number;
}

export interface ReviewStats {
	total: number;
	pending: number;
	approved: number;
	rejected: number;
	featured: number;
	avgRating: number;
}

export class ReviewService {
	// ─── Public (storefront) ──────────────────────────────────────────

	static async listProductReviews(
		db: DrizzleD1Database<typeof schema>,
		productId: string,
		limit = 20
	) {
		try {
			const rows = await db
				.select()
				.from(schema.reviews)
				.where(
					and(
						eq(schema.reviews.productId, productId),
						eq(schema.reviews.status, 'approved')
					)
				)
				.orderBy(desc(schema.reviews.isFeatured), desc(schema.reviews.createdAt))
				.limit(limit)
				.all();

			return rows.map((r) => ({
				id: r.id,
				productId: r.productId,
				name: r.author,
				city: r.role || 'কাস্টমার',
				rating: r.rating || 5,
				title: r.title,
				comment: r.content,
				verified: Boolean(r.verified),
				isFeatured: Boolean(r.isFeatured),
				adminReply: r.adminReply || null,
				adminReplyAt: r.adminReplyAt
					? new Date(r.adminReplyAt).toLocaleDateString('bn-BD', {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						})
					: null,
				date: r.createdAt
					? new Date(r.createdAt).toLocaleDateString('bn-BD', {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						})
					: 'সম্প্রতি'
			}));
		} catch (error) {
			console.error('Error fetching reviews in ReviewService:', error);
			return [];
		}
	}

	static async addReview(db: DrizzleD1Database<typeof schema>, input: CreateReviewInput) {
		const newId = crypto.randomUUID();
		await db.insert(schema.reviews).values({
			id: newId,
			productId: input.productId,
			author: input.author.trim(),
			role: input.role?.trim() || 'কাস্টমার',
			rating: Math.max(1, Math.min(5, input.rating || 5)),
			title: input.title?.trim() || 'চমৎকার পণ্য',
			content: input.content.trim(),
			verified: input.verified ?? false,
			phone: input.phone?.trim() || null,
			status: 'pending'
		});

		await this.recalcProductRating(db, input.productId);
		return { success: true, id: newId };
	}

	// ─── Admin ────────────────────────────────────────────────────────

	static async getStats(db: DrizzleD1Database<typeof schema>): Promise<ReviewStats> {
		try {
			const rows = await db
				.select({
					status: schema.reviews.status,
					cnt: sql<number>`count(*)`,
					avgRat: sql<number>`avg(${schema.reviews.rating})`,
					featuredCnt: sql<number>`sum(case when ${schema.reviews.isFeatured} = 1 then 1 else 0 end)`
				})
				.from(schema.reviews)
				.groupBy(schema.reviews.status)
				.all();

			let total = 0,
				pending = 0,
				approved = 0,
				rejected = 0,
				featured = 0;
			let ratingSum = 0,
				ratingCount = 0;

			for (const r of rows) {
				const c = Number(r.cnt) || 0;
				total += c;
				if (r.status === 'pending') pending = c;
				else if (r.status === 'approved') approved = c;
				else if (r.status === 'rejected') rejected = c;
				featured += Number(r.featuredCnt) || 0;
				ratingSum += (Number(r.avgRat) || 0) * c;
				ratingCount += c;
			}

			return {
				total,
				pending,
				approved,
				rejected,
				featured,
				avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0
			};
		} catch (e) {
			console.error('ReviewService.getStats error:', e);
			return { total: 0, pending: 0, approved: 0, rejected: 0, featured: 0, avgRating: 0 };
		}
	}

	static async listAll(db: DrizzleD1Database<typeof schema>, opts: ListReviewsOptions) {
		try {
			const conditions: any[] = [];

			if (opts.status && opts.status !== 'all') {
				conditions.push(eq(schema.reviews.status, opts.status));
			}
			if (opts.featured) {
				conditions.push(eq(schema.reviews.isFeatured, true));
			}
			if (opts.rating) {
				conditions.push(eq(schema.reviews.rating, opts.rating));
			}
			if (opts.productId) {
				conditions.push(eq(schema.reviews.productId, opts.productId));
			}
			if (opts.search) {
				const s = `%${opts.search}%`;
				conditions.push(
					or(
						like(schema.reviews.author, s),
						like(schema.reviews.content, s),
						like(schema.reviews.title, s)
					)
				);
			}

			const where = conditions.length > 0 ? and(...conditions) : undefined;

			const [items, countResult] = await Promise.all([
				db
					.select({
						id: schema.reviews.id,
						productId: schema.reviews.productId,
						author: schema.reviews.author,
						role: schema.reviews.role,
						rating: schema.reviews.rating,
						title: schema.reviews.title,
						content: schema.reviews.content,
						verified: schema.reviews.verified,
						status: schema.reviews.status,
						isFeatured: schema.reviews.isFeatured,
						adminReply: schema.reviews.adminReply,
						adminReplyAt: schema.reviews.adminReplyAt,
						repliedBy: schema.reviews.repliedBy,
						phone: schema.reviews.phone,
						images: schema.reviews.images,
						helpfulCount: schema.reviews.helpfulCount,
						createdAt: schema.reviews.createdAt,
						productName: schema.products.name,
						productSlug: schema.products.slug,
						productImage: schema.products.image
					})
					.from(schema.reviews)
					.leftJoin(schema.products, eq(schema.reviews.productId, schema.products.id))
					.where(where)
					.orderBy(desc(schema.reviews.createdAt))
					.limit(opts.limit)
					.offset(opts.offset)
					.all(),
				db
					.select({ cnt: sql<number>`count(*)` })
					.from(schema.reviews)
					.where(where)
					.all()
			]);

			return {
				items,
				totalCount: Number(countResult[0]?.cnt) || 0
			};
		} catch (e) {
			console.error('ReviewService.listAll error:', e);
			return { items: [], totalCount: 0 };
		}
	}

	static async getById(db: DrizzleD1Database<typeof schema>, id: string) {
		return db.select().from(schema.reviews).where(eq(schema.reviews.id, id)).get();
	}

	static async updateStatus(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		status: ReviewStatus
	) {
		const review = await this.getById(db, id);
		if (!review) throw new Error('রিভিউটি পাওয়া যায়নি');

		await db.update(schema.reviews).set({ status }).where(eq(schema.reviews.id, id));

		await this.recalcProductRating(db, review.productId);
		return { success: true };
	}

	static async bulkUpdateStatus(
		db: DrizzleD1Database<typeof schema>,
		ids: string[],
		status: ReviewStatus
	) {
		if (ids.length === 0) return { success: true, count: 0 };

		const affectedReviews = await db
			.select({ productId: schema.reviews.productId })
			.from(schema.reviews)
			.where(inArray(schema.reviews.id, ids))
			.all();

		await db.update(schema.reviews).set({ status }).where(inArray(schema.reviews.id, ids));

		const productIds = [...new Set(affectedReviews.map((r) => r.productId))];
		for (const pid of productIds) {
			await this.recalcProductRating(db, pid);
		}

		return { success: true, count: ids.length };
	}

	static async deleteReview(db: DrizzleD1Database<typeof schema>, id: string) {
		const review = await this.getById(db, id);
		if (!review) throw new Error('রিভিউটি পাওয়া যায়নি');

		await db.delete(schema.reviews).where(eq(schema.reviews.id, id));
		await this.recalcProductRating(db, review.productId);
		return { success: true };
	}

	static async bulkDelete(db: DrizzleD1Database<typeof schema>, ids: string[]) {
		if (ids.length === 0) return { success: true, count: 0 };

		const affectedReviews = await db
			.select({ productId: schema.reviews.productId })
			.from(schema.reviews)
			.where(inArray(schema.reviews.id, ids))
			.all();

		await db.delete(schema.reviews).where(inArray(schema.reviews.id, ids));

		const productIds = [...new Set(affectedReviews.map((r) => r.productId))];
		for (const pid of productIds) {
			await this.recalcProductRating(db, pid);
		}

		return { success: true, count: ids.length };
	}

	static async addAdminReply(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		reply: string,
		adminName: string
	) {
		const review = await this.getById(db, id);
		if (!review) throw new Error('রিভিউটি পাওয়া যায়নি');

		await db
			.update(schema.reviews)
			.set({
				adminReply: reply.trim(),
				adminReplyAt: new Date(),
				repliedBy: adminName
			})
			.where(eq(schema.reviews.id, id));

		return { success: true };
	}

	static async removeAdminReply(db: DrizzleD1Database<typeof schema>, id: string) {
		await db
			.update(schema.reviews)
			.set({ adminReply: null, adminReplyAt: null, repliedBy: null })
			.where(eq(schema.reviews.id, id));
		return { success: true };
	}

	static async toggleFeatured(db: DrizzleD1Database<typeof schema>, id: string) {
		const review = await this.getById(db, id);
		if (!review) throw new Error('রিভিউটি পাওয়া যায়নি');

		await db
			.update(schema.reviews)
			.set({ isFeatured: !review.isFeatured })
			.where(eq(schema.reviews.id, id));

		return { success: true, isFeatured: !review.isFeatured };
	}

	static async getReviewCountsByPhones(
		db: DrizzleD1Database<typeof schema>,
		phones: string[]
	): Promise<Map<string, number>> {
		const result = new Map<string, number>();
		if (phones.length === 0) return result;

		try {
			const rows = await db
				.select({
					phone: schema.reviews.phone,
					cnt: sql<number>`count(*)`
				})
				.from(schema.reviews)
				.where(inArray(schema.reviews.phone, phones))
				.groupBy(schema.reviews.phone)
				.all();

			for (const r of rows) {
				if (r.phone) result.set(r.phone, Number(r.cnt) || 0);
			}
		} catch (e) {
			console.warn('Failed to get review counts by phones:', e);
		}

		return result;
	}

	// ─── Internal ─────────────────────────────────────────────────────

	private static async recalcProductRating(
		db: DrizzleD1Database<typeof schema>,
		productId: string
	) {
		try {
			const result = await db
				.select({
					avgRating: sql<number>`avg(${schema.reviews.rating})`,
					count: sql<number>`count(*)`
				})
				.from(schema.reviews)
				.where(
					and(
						eq(schema.reviews.productId, productId),
						eq(schema.reviews.status, 'approved')
					)
				)
				.all();

			if (result?.[0]) {
				const avg = Math.round((result[0].avgRating || 0) * 10) / 10;
				const cnt = result[0].count || 0;
				await db
					.update(schema.products)
					.set({ rating: avg, reviewsCount: cnt })
					.where(eq(schema.products.id, productId));
			}
		} catch (e) {
			console.warn('Failed to recalc product rating:', e);
		}
	}
}
