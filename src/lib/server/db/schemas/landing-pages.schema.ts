import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { products } from './products.schema';

// Landing Pages Table
export const landingPages = sqliteTable(
	'landing_pages',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		title: text('title').notNull(),
		slug: text('slug').notNull(),
		sku: text('sku'),
		productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
		tag: text('tag'),
		category: text('category').default('General'),
		status: text('status').notNull().default('Published'), // 'Published' | 'Draft' | 'Archived'
		views: integer('views').notNull().default(0),
		conversions: integer('conversions').notNull().default(0),
		conversionRate: text('conversion_rate').default('0%'),
		template: text('template').default('default'),
		customDomain: text('custom_domain'),
		livePath: text('live_path').default('/'),
		metaTitle: text('meta_title'),
		metaDescription: text('meta_description'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('landing_slug_uidx').on(table.slug),
		index('landing_status_idx').on(table.status)
	]
);

export type LandingPage = typeof landingPages.$inferSelect;
export type NewLandingPage = typeof landingPages.$inferInsert;
