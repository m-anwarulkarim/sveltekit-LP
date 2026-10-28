import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { products } from './products.schema';

// Customer Reviews Table
export const reviews = sqliteTable(
	'reviews',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		productId: text('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		author: text('author').notNull(),
		role: text('role').notNull(),
		rating: integer('rating').notNull().default(5),
		title: text('title').notNull(),
		content: text('content').notNull(),
		verified: integer('verified', { mode: 'boolean' }).notNull().default(true),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('reviews_product_idx').on(table.productId)]
);

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
