import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
