import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Coupons & Discount Offers Table
export const coupons = sqliteTable(
	'coupons',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		code: text('code').notNull(), // e.g. "AURA20", "EID50"
		discountType: text('discount_type').notNull().default('percentage'), // 'percentage' | 'fixed'
		discountValue: integer('discount_value').notNull(),
		minOrderAmount: integer('min_order_amount').default(0),
		maxDiscountAmount: integer('max_discount_amount'),
		usageLimit: integer('usage_limit'),
		usageCount: integer('usage_count').notNull().default(0),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('coupons_code_uidx').on(table.code),
		index('coupons_active_idx').on(table.isActive, table.expiresAt)
	]
);

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

