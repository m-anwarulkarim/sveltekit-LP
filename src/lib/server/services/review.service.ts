import { eq, desc, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface CreateReviewInput {
	productId: string;
	author: string;
	role?: string;
	rating: number;
	title?: string;
	content: string;
	verified?: boolean;
}

export class ReviewService {
	/**
	 * Lists verified customer reviews for a given product
	 */
	static async listProductReviews(
		db: DrizzleD1Database<typeof schema>,
		productId: string,
		limit = 20
	) {
		try {
			const rows = await db
				.select()
				.from(schema.reviews)
				.where(eq(schema.reviews.productId, productId))
				.orderBy(desc(schema.reviews.createdAt))
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
				date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : 'সম্প্রতি'
			}));
		} catch (error) {
			console.error('Error fetching reviews in ReviewService:', error);
			return [];
		}
	}

	/**
	 * Inserts a customer review into the database
	 */
	static async addReview(
		db: DrizzleD1Database<typeof schema>,
		input: CreateReviewInput
	) {
		const newId = crypto.randomUUID();
		await db.insert(schema.reviews).values({
			id: newId,
			productId: input.productId,
			author: input.author.trim(),
			role: input.role?.trim() || 'ভেরিফাইড ক্রেতা',
			rating: Math.max(1, Math.min(5, input.rating || 5)),
			title: input.title?.trim() || 'চমৎকার পণ্য',
			content: input.content.trim(),
			verified: input.verified ?? true
		});

		// Recalculate average rating for the product
		try {
			const avgResult = await db
				.select({
					avgRating: sql<number>`avg(${schema.reviews.rating})`,
					count: sql<number>`count(*)`
				})
				.from(schema.reviews)
				.where(eq(schema.reviews.productId, input.productId))
				.all();

			if (avgResult && avgResult[0]) {
				const avg = Math.round((avgResult[0].avgRating || 5) * 10) / 10;
				const cnt = avgResult[0].count || 1;
				await db
					.update(schema.products)
					.set({
						rating: avg,
						reviewsCount: cnt
					})
					.where(eq(schema.products.id, input.productId));
			}
		} catch (e) {
			console.warn('Failed to update product rating aggregate:', e);
		}

		return { success: true, id: newId };
	}
}

