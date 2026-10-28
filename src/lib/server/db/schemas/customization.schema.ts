import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. Carousels Table (Homepage Hero Sliders)
export const carousels = sqliteTable(
	'carousels',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		image: text('image').notNull(),
		mobileImage: text('mobile_image'),
		targetUrl: text('target_url').notNull(),
		urlType: text('url_type').default('internal'),
		sortOrder: integer('sort_order').notNull().default(0),
		status: text('status').notNull().default('active'), // 'active' | 'inactive'
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('carousel_active_sort_idx').on(table.status, table.sortOrder)]
);

// 2. Promotional Banners Table
export const banners = sqliteTable(
	'banners',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		title: text('title').notNull(),
		image: text('image').notNull(),
		targetUrl: text('target_url').notNull(),
		placement: text('placement').notNull().default('hero_bottom'), // 'hero_bottom' | 'category_middle' | 'footer_top'
		sortOrder: integer('sort_order').notNull().default(0),
		status: text('status').notNull().default('active'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('banner_placement_status_idx').on(table.placement, table.status, table.sortOrder)]
);

// 3. Popups & Modal Offers Table
export const popups = sqliteTable('popups', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	triggerType: text('trigger_type').default('on_load'), // 'on_load' | 'exit_intent' | 'delay_seconds'
	delaySeconds: integer('delay_seconds').default(5),
	imageUrl: text('image_url'),
	targetUrl: text('target_url'),
	status: text('status').notNull().default('active'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

export type Carousel = typeof carousels.$inferSelect;
export type NewCarousel = typeof carousels.$inferInsert;
export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;
export type Popup = typeof popups.$inferSelect;
export type NewPopup = typeof popups.$inferInsert;
