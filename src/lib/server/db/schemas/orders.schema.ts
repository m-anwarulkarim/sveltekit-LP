import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Orders Table
export const orders = sqliteTable('orders', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id'),
	customerName: text('customer_name').notNull(),
	customerEmail: text('customer_email').notNull(),
	shippingAddress: text('shipping_address').notNull(),
	items: text('items').notNull(), // JSON string: [{ id, name, price, quantity }]
	total: integer('total').notNull(),
	status: text('status').notNull().default('paid'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
