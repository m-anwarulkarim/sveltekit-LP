import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { products } from './products.schema';

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

		// Moderation
		status: text('status', { enum: ['pending', 'approved', 'rejected'] })
			.notNull()
			.default('pending'),
		isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),

		// Admin reply
		adminReply: text('admin_reply'),
		adminReplyAt: integer('admin_reply_at', { mode: 'timestamp_ms' }),
		repliedBy: text('replied_by'),

		// Customer contact
		phone: text('phone'),
		images: text('images'), // JSON array of image URLs

		// Helpful votes
		helpfulCount: integer('helpful_count').notNull().default(0),

		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('reviews_product_idx').on(table.productId),
		index('reviews_status_idx').on(table.status)
	]
);

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
