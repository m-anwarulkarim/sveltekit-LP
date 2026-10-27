import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Customer Reviews Table
export const reviews = sqliteTable('reviews', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	productId: text('product_id').notNull(),
	author: text('author').notNull(),
	role: text('role').notNull(),
	rating: integer('rating').notNull().default(5),
	title: text('title').notNull(),
	content: text('content').notNull(),
	verified: integer('verified', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
