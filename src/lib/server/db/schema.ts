import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Products Table
export const products = sqliteTable('products', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	tagline: text('tagline').notNull(),
	price: integer('price').notNull(), // price in USD cents, e.g. 34900 = $349.00
	originalPrice: integer('original_price').notNull(),
	rating: integer('rating').notNull().default(49), // 49 = 4.9 / 5.0
	reviewsCount: integer('reviews_count').notNull().default(120),
	image: text('image').notNull(),
	category: text('category').notNull(), // 'Audio', 'Hardware', 'Software', 'Studio'
	badge: text('badge'), // 'Bestseller', 'Flagship', 'New'
	inStock: integer('in_stock', { mode: 'boolean' }).notNull().default(true),
	description: text('description').notNull()
});

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

// Newsletter subscribers
export const newsletter = sqliteTable('newsletter', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	email: text('email').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

// Better Auth Schema exports
export * from './auth.schema';
