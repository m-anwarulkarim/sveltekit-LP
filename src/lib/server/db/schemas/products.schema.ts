import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { categories, brands } from './categories.schema';

// Products Table (Covers all 9 admin product editor cards)
export const products = sqliteTable(
	'products',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		tagline: text('tagline'),
		categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
		category: text('category'), // Denormalized name for legacy compatibility
		subCategoryId: text('sub_category_id'),
		childCategoryId: text('child_category_id'),
		brandId: text('brand_id').references(() => brands.id, { onDelete: 'set null' }),
		model: text('model'),

		// Pricing (Stored as integer to avoid floating point math errors)
		price: integer('price').notNull(), // Primary display price
		regularPrice: integer('regular_price'),
		salePrice: integer('sale_price'),
		originalPrice: integer('original_price').notNull().default(0),
		costPrice: integer('cost_price'), // Cost of goods for profit/loss calculation

		// Inventory
		sku: text('sku'),
		totalStock: integer('total_stock').notNull().default(0),
		stock: integer('stock'), // Legacy alias
		openingStock: integer('opening_stock').notNull().default(0),
		lowStockAlert: integer('low_stock_alert').notNull().default(5),
		inStock: integer('in_stock', { mode: 'boolean' }).notNull().default(true),
		isLowStock: integer('is_low_stock', { mode: 'boolean' }).notNull().default(false),

		// Status, Flags & Badges
		status: text('status').notNull().default('published'), // 'published' | 'draft' | 'archived'
		badge: text('badge'), // 'Bestseller' | 'Flagship' | 'New' | 'Published'
		priority: text('priority').default('-'),
		isPreOrder: integer('is_pre_order', { mode: 'boolean' }).notNull().default(false),
		isWholesale: integer('is_wholesale', { mode: 'boolean' }).notNull().default(false),
		urgencyMessage: text('urgency_message'),

		// Processing Fees
		enableProcessing: integer('enable_processing', { mode: 'boolean' }).notNull().default(false),
		processingOptions: text('processing_options'), // JSON string: ["Gift Wrap: ৳50"]

		// Media Assets
		image: text('image').notNull(), // Primary image
		featuredImage: text('featured_image'),
		galleryImages: text('gallery_images'), // JSON array of URLs
		sizeChartImage: text('size_chart_image'),

		// Content & SEO
		description: text('description').notNull(),
		returnPolicy: text('return_policy'),
		seoTitle: text('seo_title'),
		seoDescription: text('seo_description'),
		seoKeywords: text('seo_keywords'),

		// Social Proof & Metrics
		rating: integer('rating').notNull().default(49), // 49 = 4.9/5
		reviewsCount: integer('reviews_count').notNull().default(120),
		salesCount: integer('sales_count').notNull().default(0),
		viewCount: integer('view_count').notNull().default(0),

		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('products_slug_uidx').on(table.slug),
		index('products_cat_status_idx').on(table.categoryId, table.status),
		index('products_sub_cat_idx').on(table.subCategoryId),
		index('products_child_cat_idx').on(table.childCategoryId),
		index('products_status_created_idx').on(table.status, table.createdAt),
		index('products_stock_alert_idx').on(table.inStock, table.totalStock, table.lowStockAlert),
		index('products_price_idx').on(table.price)
	]
);

// Product Variants Table
export const productVariants = sqliteTable(
	'product_variants',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		productId: text('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		sku: text('sku').notNull(),
		name: text('name').notNull(), // 'WHITE', 'BLACK', 'RED 100ml'
		color: text('color'),
		size: text('size'),
		price: integer('price'),
		costPrice: integer('cost_price'),
		stock: integer('stock').notNull().default(0),
		openingStock: integer('opening_stock').notNull().default(0),
		image: text('image'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [
		uniqueIndex('variants_sku_uidx').on(table.sku),
		index('variants_product_idx').on(table.productId),
		index('variants_stock_idx').on(table.stock)
	]
);

// Product Technical Specifications Table
export const productSpecs = sqliteTable(
	'product_specs',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		productId: text('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		key: text('key').notNull(),
		value: text('value').notNull(),
		sortOrder: integer('sort_order').notNull().default(0)
	},
	(table) => [index('specs_product_idx').on(table.productId, table.sortOrder)]
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type ProductSpec = typeof productSpecs.$inferSelect;
export type NewProductSpec = typeof productSpecs.$inferInsert;
