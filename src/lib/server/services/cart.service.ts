import { eq, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface CartPayload {
	items: any[];
	couponCode?: string;
	discountPercent?: number;
}

export class CartService {
	/**
	 * Retrieve a user's stored cart from database
	 */
	static async getUserCart(db: DrizzleD1Database<typeof schema>, userId: string) {
		try {
			const record = await db
				.select()
				.from(schema.userCarts)
				.where(eq(schema.userCarts.userId, userId))
				.get();

			if (!record) return null;

			let items: any[] = [];
			try {
				items = JSON.parse(record.items || '[]');
			} catch {
				items = [];
			}

			return {
				userId: record.userId,
				items,
				couponCode: record.couponCode || '',
				discountPercent: record.discountPercent || 0,
				updatedAt: record.updatedAt
			};
		} catch (e) {
			console.error('Failed to get user cart:', e);
			return null;
		}
	}

	/**
	 * Save or update user's cart in database
	 */
	static async saveUserCart(
		db: DrizzleD1Database<typeof schema>,
		userId: string,
		payload: CartPayload
	) {
		try {
			const itemsJson = JSON.stringify(payload.items || []);
			const couponCode = payload.couponCode || '';
			const discountPercent = Number(payload.discountPercent) || 0;
			const now = new Date();

			await db
				.insert(schema.userCarts)
				.values({
					userId,
					items: itemsJson,
					couponCode,
					discountPercent,
					updatedAt: now
				})
				.onConflictDoUpdate({
					target: schema.userCarts.userId,
					set: {
						items: itemsJson,
						couponCode,
						discountPercent,
						updatedAt: now
					}
				});

			return { success: true };
		} catch (e) {
			console.error('Failed to save user cart:', e);
			return { success: false, error: e };
		}
	}

	/**
	 * Clear a user's cart in database (e.g. after successful order placement)
	 */
	static async clearUserCart(db: DrizzleD1Database<typeof schema>, userId: string) {
		try {
			await db.delete(schema.userCarts).where(eq(schema.userCarts.userId, userId));
			return { success: true };
		} catch (e) {
			console.error('Failed to clear user cart:', e);
			return { success: false, error: e };
		}
	}
}

