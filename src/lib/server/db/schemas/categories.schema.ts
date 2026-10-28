import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. Categories Table (Hierarchical: Parent -> Sub -> Child)
export const categories = sqliteTable(
	'categories',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		parentId: text('parent_id').references((): any => categories.id, { onDelete: 'cascade' }), // Self-referencing: null = Parent, set = Sub/Child
		icon: text('icon'),
		image: text('image'),
		bannerImage: text('banner_image'),
		description: text('description'),
		sortOrder: integer('sort_order').notNull().default(0),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
		seoTitle: text('seo_title'),
		seoDescription: text('seo_description'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('cat_slug_uidx').on(table.slug),
		index('cat_parent_idx').on(table.parentId),
		index('cat_active_sort_idx').on(table.isActive, table.sortOrder)
	]
);

// 2. Brands Table
export const brands = sqliteTable(
	'brands',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		logo: text('logo'),
		website: text('website'),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [uniqueIndex('brands_slug_uidx').on(table.slug)]
);

// 3. Search & Filter Tags Table
export const tags = sqliteTable(
	'tags',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		badgeColor: text('badge_color').default('bg-indigo-50 text-indigo-700'),
		homeShow: text('home_show').default('Yes'),
		priority: text('priority').default('-'),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [uniqueIndex('tags_slug_uidx').on(table.slug)]
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
