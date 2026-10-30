import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Coupons & Discount Offers Table
export const coupons = sqliteTable(
	'coupons',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull().default('Special Discount'),
		code: text('code').notNull(), // e.g. "AURA20", "EID50"
		bannerImage: text('banner_image'),
		discountType: text('discount_type').notNull().default('percentage'), // 'percentage' | 'fixed'
		discountValue: integer('discount_value').notNull(),
		minOrderAmount: integer('min_order_amount').default(0),
		maxDiscountAmount: integer('max_discount_amount'),
		description: text('description'),
		startDate: text('start_date'),
		endDate: text('end_date'),
		status: text('status').notNull().default('publish'), // 'publish' | 'draft' | 'trash'
		usageLimit: integer('usage_limit'),
		usageCount: integer('usage_count').notNull().default(0),
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
		index('coupons_status_idx').on(table.status),
		index('coupons_active_idx').on(table.isActive, table.endDate)
	]
);

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

