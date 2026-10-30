import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { user } from './auth.schema';

// User Cart Storage for Logged-in Users (Hybrid Persistence)
export const userCarts = sqliteTable('user_carts', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	items: text('items').notNull().default('[]'),
	couponCode: text('coupon_code'),
	discountPercent: integer('discount_percent').default(0),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export type UserCart = typeof userCarts.$inferSelect;
export type NewUserCart = typeof userCarts.$inferInsert;

