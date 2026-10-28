import { eq, or, desc, asc, and, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface ProductFilterOptions {
	category?: string;
	status?: 'published' | 'active' | 'draft' | 'archived' | 'all';
	sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
	limit?: number;
	offset?: number;
}

/**
 * Enterprise Product Catalog & Inventory Service
 */
export class ProductService {
	/**
	 * Lists products with filtering, sorting, and pagination
	 */
	static async listProducts(
		db: DrizzleD1Database<typeof schema>,
		options: ProductFilterOptions = {}
	) {
		const conditions: any[] = [];

		if (options.status && options.status !== 'all') {
			const statusVal = options.status === 'active' ? 'published' : options.status;
			conditions.push(eq(schema.products.status, statusVal));
		}

		if (options.category && options.category !== 'all') {
			conditions.push(eq(schema.products.category, options.category));
		}

		let query = db.select().from(schema.products);

		if (conditions.length > 0) {
			query = query.where(and(...conditions)) as any;
		}

		if (options.sortBy === 'price_asc') {
			query = query.orderBy(asc(schema.products.price)) as any;
		} else if (options.sortBy === 'price_desc') {
			query = query.orderBy(desc(schema.products.price)) as any;
		} else {
			query = query.orderBy(desc(schema.products.createdAt)) as any;
		}

		if (options.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query.all();
	}

	/**
	 * Retrieves single product with variants and specifications
	 */
	static async getProductBySlug(db: DrizzleD1Database<typeof schema>, slug: string) {
		const product = await db
			.select()
			.from(schema.products)
			.where(eq(schema.products.slug, slug))
			.get();

		if (!product) return null;

		const variants = await db
			.select()
			.from(schema.productVariants)
			.where(eq(schema.productVariants.productId, product.id));

		const specs = await db
			.select()
			.from(schema.productSpecs)
			.where(eq(schema.productSpecs.productId, product.id))
			.orderBy(asc(schema.productSpecs.sortOrder));

		return {
			...product,
			variants,
			specs
		};
	}

	/**
	 * Atomically adjusts inventory stock for a product or variant
	 */
	static async adjustStock(
		db: DrizzleD1Database<typeof schema>,
		productId: string,
		quantityDelta: number,
		variantId?: string | null
	) {
		if (variantId) {
			await db
				.update(schema.productVariants)
				.set({
					stock: sql`${schema.productVariants.stock} + ${quantityDelta}`
				})
				.where(eq(schema.productVariants.id, variantId));
		}

		await db
			.update(schema.products)
			.set({
				stock: sql`${schema.products.stock} + ${quantityDelta}`,
				updatedAt: new Date()
			})
			.where(eq(schema.products.id, productId));
	}

	/**
	 * Checks products running low on inventory
	 */
	static async getLowStockAlerts(db: DrizzleD1Database<typeof schema>, threshold = 5) {
		return await db
			.select({
				id: schema.products.id,
				name: schema.products.name,
				slug: schema.products.slug,
				stock: schema.products.stock
			})
			.from(schema.products)
			.where(sql`${schema.products.stock} <= ${threshold} AND ${schema.products.status} = 'active'`)
			.orderBy(asc(schema.products.stock))
			.all();
	}

	/**
	 * Creates a new product in the database
	 */
	static async createProduct(
		db: DrizzleD1Database<typeof schema>,
		data: Partial<typeof schema.products.$inferInsert>
	) {
		const newId = data.id || `prod-${Date.now()}`;
		const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[\s\W-]+/g, '-') : newId);

		const insertPayload: typeof schema.products.$inferInsert = {
			id: newId,
			name: data.name || 'New Product',
			slug,
			tagline: data.tagline || data.name || '',
			category: data.category || 'General',
			price: Number(data.price) || 0,
			regularPrice: Number(data.regularPrice) || Number(data.price) || 0,
			salePrice: Number(data.salePrice) || Number(data.price) || 0,
			originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
			costPrice: Number(data.costPrice) || 0,
			totalStock: Number(data.totalStock ?? data.stock) || 0,
			stock: Number(data.stock ?? data.totalStock) || 0,
			openingStock: Number(data.openingStock) || 0,
			lowStockAlert: Number(data.lowStockAlert) || 5,
			inStock: Boolean(data.inStock ?? true),
			status: data.status || 'published',
			badge: data.badge || 'Published',
			image: data.image || '/images/products/speaker-front.webp',
			description: data.description || '',
			sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
			model: data.model || null,
			priority: data.priority || '-',
			isPreOrder: Boolean(data.isPreOrder),
			isWholesale: Boolean(data.isWholesale),
			urgencyMessage: data.urgencyMessage || null,
			enableProcessing: Boolean(data.enableProcessing),
			galleryImages: data.galleryImages || '[]',
			sizeChartImage: data.sizeChartImage || null,
			returnPolicy: data.returnPolicy || null,
			seoTitle: data.seoTitle || null,
			seoDescription: data.seoDescription || null,
			seoKeywords: data.seoKeywords || null
		};

		await db.insert(schema.products).values(insertPayload);
		return insertPayload;
	}

	/**
	 * Updates existing product
	 */
	static async updateProduct(
		db: DrizzleD1Database<typeof schema>,
		idOrSlug: string,
		data: any
	) {
		const updatePayload: Record<string, any> = {
			updatedAt: new Date()
		};

		if (data.name !== undefined) updatePayload.name = String(data.name);
		if (data.slug !== undefined) updatePayload.slug = String(data.slug);
		if (data.tagline !== undefined) updatePayload.tagline = String(data.tagline);
		if (data.category !== undefined) updatePayload.category = String(data.category);
		if (data.price !== undefined) updatePayload.price = Number(data.price);
		if (data.regularPrice !== undefined) updatePayload.regularPrice = Number(data.regularPrice);
		if (data.originalPrice !== undefined) updatePayload.originalPrice = Number(data.originalPrice);
		if (data.costPrice !== undefined) updatePayload.costPrice = Number(data.costPrice);
		if (data.stock !== undefined) {
			updatePayload.stock = Number(data.stock);
			updatePayload.totalStock = Number(data.stock);
		}
		if (data.image !== undefined) updatePayload.image = String(data.image);
		if (data.description !== undefined) updatePayload.description = String(data.description);
		if (data.status !== undefined) updatePayload.status = String(data.status);
		if (data.badge !== undefined) updatePayload.badge = String(data.badge);
		if (data.model !== undefined) updatePayload.model = String(data.model);
		if (data.returnPolicy !== undefined) updatePayload.returnPolicy = String(data.returnPolicy);
		if (data.seoTitle !== undefined) updatePayload.seoTitle = String(data.seoTitle);
		if (data.seoDescription !== undefined) updatePayload.seoDescription = String(data.seoDescription);
		if (data.seoKeywords !== undefined) updatePayload.seoKeywords = String(data.seoKeywords);

		// Handle gallery images
		if (data.images && Array.isArray(data.images)) {
			updatePayload.galleryImages = JSON.stringify(data.images);
		} else if (data.galleryImages) {
			updatePayload.galleryImages = typeof data.galleryImages === 'string' ? data.galleryImages : JSON.stringify(data.galleryImages);
		}

		await db
			.update(schema.products)
			.set(updatePayload)
			.where(or(eq(schema.products.id, idOrSlug), eq(schema.products.slug, idOrSlug)));
		return { success: true, id: idOrSlug };
	}

	/**
	 * Deletes product from database
	 */
	static async deleteProduct(db: DrizzleD1Database<typeof schema>, id: string) {
		await db.delete(schema.products).where(eq(schema.products.id, id));
		return { success: true, deletedId: id };
	}

	/**
	 * Toggles product status between 'published' and 'draft'
	 */
	static async toggleProductStatus(db: DrizzleD1Database<typeof schema>, id: string) {
		const existing = await db.select().from(schema.products).where(eq(schema.products.id, id)).get();
		if (!existing) return { success: false, error: 'Product not found' };

		const nextStatus = existing.status === 'published' ? 'draft' : 'published';
		await db.update(schema.products).set({ status: nextStatus, updatedAt: new Date() }).where(eq(schema.products.id, id));
		return { success: true, nextStatus };
	}

	/**
	 * Duplicates an existing product
	 */
	static async duplicateProduct(db: DrizzleD1Database<typeof schema>, id: string) {
		const existing = await db.select().from(schema.products).where(eq(schema.products.id, id)).get();
		if (!existing) return { success: false, error: 'Product not found' };

		const newId = `prod-${Date.now()}`;
		const newSlug = `${existing.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;

		const copy = {
			...existing,
			id: newId,
			name: `${existing.name} (Copy)`,
			slug: newSlug,
			status: 'draft',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.insert(schema.products).values(copy);
		return { success: true, duplicatedProduct: copy };
	}
}

