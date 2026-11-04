import {
	eq,
	or,
	desc,
	asc,
	and,
	sql,
	inArray,
	notInArray,
	getTableColumns
} from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { slugify } from '../../utils/slug';
import {
	parseProductInput,
	ProductValidationError,
	type ProductInput
} from '../validations/product.validation';

export { ProductValidationError };

type Db = DrizzleD1Database<typeof schema>;

export interface ProductFilterOptions {
	category?: string;
	status?: 'published' | 'active' | 'draft' | 'archived' | 'all';
	sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
	limit?: number;
	offset?: number;
}

/** Product and variant columns safe to send to storefront visitors: no cost prices. */
const { costPrice: _productCost, ...productColumns } = getTableColumns(schema.products);
const { costPrice: _variantCost, ...variantColumns } = getTableColumns(schema.productVariants);
export const publicProductColumns = productColumns;
export const publicVariantColumns = variantColumns;

// The admin list never shows these long fields, so they stay out of the page payload.
const {
	description: _description,
	returnPolicy: _returnPolicy,
	seoTitle: _seoTitle,
	seoDescription: _seoDescription,
	seoKeywords: _seoKeywords,
	galleryImages: _galleryImages,
	processingOptions: _processingOptions,
	urgencyMessage: _urgencyMessage,
	...adminListColumns
} = getTableColumns(schema.products);

const MAX_BULK_IDS = 200;
const SQL_CHUNK = 50;

function chunk<T>(items: T[], size = SQL_CHUNK): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
	return out;
}

/** Drops undefined keys so an update never overwrites a column the form did not send. */
function compact<T extends Record<string, unknown>>(values: T): Partial<T> {
	return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** '' and null both mean "clear this field"; undefined means "leave it alone". */
function clearable(value: string | null | undefined): string | null | undefined {
	if (value === undefined) return undefined;
	return value === null || value === '' ? null : value;
}

function translateDbError(error: unknown): never {
	const message = error instanceof Error ? error.message : String(error);
	const cause = (error as { cause?: { message?: string } })?.cause?.message ?? '';
	const text = `${message} ${cause}`;
	if (/UNIQUE constraint failed: products\.slug|products_slug_uidx/i.test(text)) {
		throw new ProductValidationError('এই slug ইতিমধ্যে অন্য প্রোডাক্টে ব্যবহৃত। অন্য slug দিন।');
	}
	if (/variants_sku_uidx|product_variants\.sku/i.test(text)) {
		throw new ProductValidationError('একটি ভ্যারিয়েন্ট SKU অন্য প্রোডাক্টে ব্যবহৃত। SKU বদলান।');
	}
	throw error;
}

/**
 * Enterprise Product Catalog & Inventory Service
 */
export class ProductService {
	/**
	 * Lists products with filtering, sorting, and pagination
	 */
	static async listProducts(db: Db, options: ProductFilterOptions = {}) {
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
	 * Rows for the admin product table: short columns only, with the real stock count.
	 */
	static async listAdminProducts(db: Db) {
		const [rows, categories] = await Promise.all([
			db.select(adminListColumns).from(schema.products).orderBy(desc(schema.products.createdAt)).all(),
			db.select({ id: schema.categories.id, name: schema.categories.name }).from(schema.categories).all()
		]);
		const categoryNames = new Map(categories.map((c) => [c.id, c.name]));

		return rows.map((p) => ({
			...p,
			stock: p.totalStock,
			subCategory: p.subCategoryId ? (categoryNames.get(p.subCategoryId) ?? '') : '',
			isLowStock: p.totalStock <= p.lowStockAlert
		}));
	}

	/** Names for the brand drop-down on the product form. */
	static async listBrandNames(db: Db): Promise<string[]> {
		const rows = await db
			.select({ name: schema.brands.name })
			.from(schema.brands)
			.where(eq(schema.brands.isTrash, false))
			.orderBy(asc(schema.brands.name))
			.all();
		return rows.map((r) => r.name);
	}

	/**
	 * Retrieves single product with variants and specifications
	 */
	static async getProductBySlug(db: Db, slug: string) {
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
	 * The product as the admin form expects it: names instead of ids, variants and specs included.
	 */
	static async getForEdit(db: Db, idOrSlug: string) {
		const row = await db
			.select()
			.from(schema.products)
			.where(or(eq(schema.products.id, idOrSlug), eq(schema.products.slug, idOrSlug)))
			.get();
		if (!row) return null;

		const [categories, brand, variants, specs] = await Promise.all([
			db.select({ id: schema.categories.id, name: schema.categories.name }).from(schema.categories).all(),
			row.brandId
				? db.select({ name: schema.brands.name }).from(schema.brands).where(eq(schema.brands.id, row.brandId)).get()
				: Promise.resolve(undefined),
			db
				.select()
				.from(schema.productVariants)
				.where(eq(schema.productVariants.productId, row.id))
				.orderBy(asc(schema.productVariants.createdAt))
				.all(),
			db
				.select()
				.from(schema.productSpecs)
				.where(eq(schema.productSpecs.productId, row.id))
				.orderBy(asc(schema.productSpecs.sortOrder))
				.all()
		]);
		const nameOf = (id: string | null) => categories.find((c) => c.id === id)?.name ?? '';

		const parseList = (json: string | null): string[] => {
			if (!json) return [];
			try {
				const parsed = JSON.parse(json);
				return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
			} catch {
				return [];
			}
		};
		const gallery = parseList(row.galleryImages);

		return {
			id: row.id,
			name: row.name,
			slug: row.slug,
			tagline: row.tagline ?? '',
			price: row.price,
			originalPrice: row.regularPrice || row.originalPrice || row.price,
			costPrice: row.costPrice ?? 0,
			stock: row.totalStock,
			openingStock: row.openingStock,
			lowStockQty: row.lowStockAlert,
			sku: row.sku ?? '',
			category: row.category || nameOf(row.categoryId),
			subCategory: nameOf(row.subCategoryId),
			childCategory: nameOf(row.childCategoryId),
			brand: brand?.name ?? '',
			model: row.model ?? '',
			badge: row.badge,
			status: row.status as 'published' | 'draft',
			isPreOrder: row.isPreOrder,
			isWholesale: row.isWholesale,
			urgencyMessage: row.urgencyMessage ?? '',
			enableProcessing: row.enableProcessing,
			processingOptions: parseList(row.processingOptions),
			specifications: specs.map((s) => ({ key: s.key, value: s.value })),
			variants: variants.map((v) => ({
				id: v.id,
				name: v.name,
				stock: v.stock,
				openingStock: v.openingStock,
				sku: v.sku,
				price: v.price ?? row.price,
				image: v.image ?? ''
			})),
			image: row.image,
			images: gallery.length > 0 ? gallery : [row.image],
			sizeChartImage: row.sizeChartImage ?? '',
			description: row.description,
			returnPolicy: row.returnPolicy ?? '',
			seoTitle: row.seoTitle ?? '',
			seoDescription: row.seoDescription ?? '',
			seoKeywords: row.seoKeywords ?? ''
		};
	}

	/**
	 * Atomically adjusts inventory stock for a product or variant
	 */
	static async adjustStock(db: Db, productId: string, quantityDelta: number, variantId?: string | null) {
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
				totalStock: sql`${schema.products.totalStock} + ${quantityDelta}`,
				updatedAt: new Date()
			})
			.where(eq(schema.products.id, productId));
	}

	/**
	 * Checks published products running low on inventory
	 */
	static async getLowStockAlerts(db: Db, threshold = 5) {
		return await db
			.select({
				id: schema.products.id,
				name: schema.products.name,
				slug: schema.products.slug,
				stock: schema.products.totalStock
			})
			.from(schema.products)
			.where(and(sql`${schema.products.totalStock} <= ${threshold}`, eq(schema.products.status, 'published')))
			.orderBy(asc(schema.products.totalStock))
			.all();
	}

	// ---------------------------------------------------------------------------------
	// Writing products
	// ---------------------------------------------------------------------------------

	private static async resolveSlug(
		db: Db,
		input: { slug?: string | null; name: string },
		existing?: { id: string; slug: string }
	): Promise<string> {
		const typed = input.slug?.trim();

		if (typed) {
			if (existing && typed === existing.slug) return typed;
			const slug = slugify(typed);
			if (!slug) throw new ProductValidationError('Slug সঠিক নয়। অক্ষর বা সংখ্যা দিয়ে লিখুন।');
			const taken = await db
				.select({ id: schema.products.id })
				.from(schema.products)
				.where(eq(schema.products.slug, slug))
				.get();
			if (taken && taken.id !== existing?.id) {
				throw new ProductValidationError(
					`এই slug ("${slug}") ইতিমধ্যে অন্য প্রোডাক্টে ব্যবহৃত। অন্য slug দিন।`
				);
			}
			return slug;
		}

		// No slug given: derive one from the name and make it free.
		const base = slugify(input.name) || 'product';
		for (let attempt = 1; attempt <= 50; attempt++) {
			const candidate = attempt === 1 ? base : `${base}-${attempt}`;
			const taken = await db
				.select({ id: schema.products.id })
				.from(schema.products)
				.where(eq(schema.products.slug, candidate))
				.get();
			if (!taken || taken.id === existing?.id) return candidate;
		}
		return `${base}-${crypto.randomUUID().slice(0, 6)}`;
	}

	private static async resolveTaxonomy(db: Db, input: ProductInput) {
		const rows = await db
			.select({ id: schema.categories.id, name: schema.categories.name, parentId: schema.categories.parentId })
			.from(schema.categories)
			.all();
		const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

		const top = input.category ? rows.find((r) => !r.parentId && same(r.name, input.category!)) : undefined;
		const sub =
			top && input.subCategory
				? rows.find((r) => r.parentId === top.id && same(r.name, input.subCategory!))
				: undefined;
		const child =
			sub && input.childCategory
				? rows.find((r) => r.parentId === sub.id && same(r.name, input.childCategory!))
				: undefined;

		return {
			categoryId: top?.id ?? null,
			category: top?.name ?? (input.category || 'General'),
			subCategoryId: sub?.id ?? null,
			childCategoryId: child?.id ?? null
		};
	}

	/** Finds the brand by name, or creates it so the product can point at a real record. */
	private static async resolveBrandId(db: Db, name: string | null | undefined): Promise<string | null | undefined> {
		if (name === undefined || name === null) return undefined;
		const clean = name.trim();
		if (!clean) return null;

		const brands = await db
			.select({ id: schema.brands.id, name: schema.brands.name, slug: schema.brands.slug })
			.from(schema.brands)
			.all();
		const found = brands.find((b) => b.name.trim().toLowerCase() === clean.toLowerCase());
		if (found) return found.id;

		const usedSlugs = new Set(brands.map((b) => b.slug));
		const base = slugify(clean) || 'brand';
		let slug = base;
		for (let n = 2; usedSlugs.has(slug); n++) slug = `${base}-${n}`;

		const id = crypto.randomUUID();
		await db.insert(schema.brands).values({ id, name: clean, slug });
		return id;
	}

	/** Gives every variant an id and a SKU that no other product uses. */
	private static async prepareVariants(
		db: Db,
		productId: string,
		input: ProductInput,
		slug: string,
		existingIds: Set<string>
	) {
		const variants = input.variants ?? [];
		const baseSku = (input.sku || slug).toUpperCase();

		const prepared = variants.map((v, index) => ({
			id: v.id && existingIds.has(v.id) ? v.id : crypto.randomUUID(),
			isNew: !(v.id && existingIds.has(v.id)),
			name: v.name,
			sku: (v.sku?.trim() || `${baseSku}-${index + 1}`).toUpperCase(),
			price: v.price ?? input.price,
			stock: v.stock,
			openingStock: v.openingStock ?? v.stock,
			image: clearable(v.image) ?? null
		}));

		const skus = prepared.map((v) => v.sku);
		if (new Set(skus).size !== skus.length) {
			throw new ProductValidationError('দুটি ভ্যারিয়েন্টের SKU একই। প্রতিটির SKU আলাদা দিন।');
		}
		if (skus.length > 0) {
			const clash = await db
				.select({ sku: schema.productVariants.sku, productId: schema.productVariants.productId })
				.from(schema.productVariants)
				.where(inArray(schema.productVariants.sku, skus))
				.all();
			const other = clash.find((c) => c.productId !== productId);
			if (other) {
				throw new ProductValidationError(`ভ্যারিয়েন্ট SKU "${other.sku}" অন্য প্রোডাক্টে ব্যবহৃত। SKU বদলান।`);
			}
		}
		return prepared;
	}

	/** Columns shared by create and update. Undefined means the form did not send the field. */
	private static productColumns(
		input: ProductInput,
		slug: string,
		taxonomy: Awaited<ReturnType<typeof ProductService.resolveTaxonomy>>,
		brandId: string | null | undefined
	) {
		const images = input.images
			? [input.image, ...input.images.filter((u) => u !== input.image)]
			: undefined;

		return compact({
			name: input.name,
			slug,
			tagline: clearable(input.tagline) ?? undefined,
			...taxonomy,
			brandId,
			model: clearable(input.model),
			price: input.price,
			salePrice: input.price,
			regularPrice: input.originalPrice || input.price,
			originalPrice: input.originalPrice || input.price,
			costPrice: input.costPrice ?? undefined,
			lowStockAlert: input.lowStockQty ?? undefined,
			openingStock: input.openingStock ?? undefined,
			sku: clearable(input.sku),
			status: input.status,
			badge: clearable(input.badge),
			isPreOrder: input.isPreOrder ?? undefined,
			isWholesale: input.isWholesale ?? undefined,
			urgencyMessage: clearable(input.urgencyMessage),
			enableProcessing: input.enableProcessing ?? undefined,
			processingOptions: input.processingOptions ? JSON.stringify(input.processingOptions) : undefined,
			image: input.image,
			galleryImages: images ? JSON.stringify(images) : undefined,
			sizeChartImage: clearable(input.sizeChartImage),
			description: input.description ?? undefined,
			returnPolicy: clearable(input.returnPolicy),
			seoTitle: clearable(input.seoTitle),
			seoDescription: clearable(input.seoDescription),
			seoKeywords: clearable(input.seoKeywords)
		});
	}

	/**
	 * Creates a new product with its variants and specifications in one atomic batch
	 */
	static async createProduct(db: Db, raw: unknown) {
		const input = parseProductInput(raw);
		const id = crypto.randomUUID();
		const slug = await this.resolveSlug(db, input);
		const [taxonomy, brandId] = await Promise.all([
			this.resolveTaxonomy(db, input),
			this.resolveBrandId(db, input.brand)
		]);
		const variants = await this.prepareVariants(db, id, input, slug, new Set());

		const totalStock =
			variants.length > 0
				? variants.reduce((sum, v) => sum + v.stock, 0)
				: (input.stock ?? input.openingStock ?? 0);
		const lowStockAlert = input.lowStockQty ?? 5;

		const columns = this.productColumns(input, slug, taxonomy, brandId);
		const statements: any[] = [
			db.insert(schema.products).values({
				...(columns as typeof schema.products.$inferInsert),
				id,
				tagline: input.tagline?.trim() || input.name,
				description: input.description ?? '',
				totalStock,
				stock: totalStock,
				inStock: totalStock > 0,
				isLowStock: totalStock <= lowStockAlert,
				lowStockAlert,
				openingStock: input.openingStock ?? totalStock,
				sku: input.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`,
				// A new product has no reviews yet, so it starts without a rating.
				rating: 0,
				reviewsCount: 0,
				galleryImages: columns.galleryImages ?? JSON.stringify([input.image])
			}),
			...(input.specifications ?? []).map((s, index) =>
				db.insert(schema.productSpecs).values({ productId: id, key: s.key, value: s.value, sortOrder: index })
			),
			...variants.map((v) =>
				db.insert(schema.productVariants).values({
					id: v.id,
					productId: id,
					name: v.name,
					sku: v.sku,
					price: v.price,
					stock: v.stock,
					openingStock: v.openingStock,
					image: v.image
				})
			)
		];

		try {
			await db.batch(statements as [any, ...any[]]);
		} catch (error) {
			translateDbError(error);
		}
		return { id, slug, name: input.name };
	}

	/**
	 * Updates an existing product. Stock is only touched when the admin changed it, so a
	 * description edit can never undo the sales since the form was opened.
	 */
	static async updateProduct(db: Db, idOrSlug: string, raw: unknown) {
		const input = parseProductInput(raw);
		const existing = await db
			.select()
			.from(schema.products)
			.where(or(eq(schema.products.id, idOrSlug), eq(schema.products.slug, idOrSlug)))
			.get();
		if (!existing) throw new ProductValidationError('প্রোডাক্টটি পাওয়া যায়নি');

		const slug = await this.resolveSlug(db, input, { id: existing.id, slug: existing.slug });
		const [taxonomy, brandId] = await Promise.all([
			this.resolveTaxonomy(db, input),
			this.resolveBrandId(db, input.brand)
		]);

		const set: Record<string, unknown> = this.productColumns(input, slug, taxonomy, brandId);
		set.updatedAt = new Date();

		const statements: any[] = [];
		let variantRows: Awaited<ReturnType<typeof ProductService.prepareVariants>> | null = null;

		if (input.variants) {
			const current = await db
				.select({ id: schema.productVariants.id })
				.from(schema.productVariants)
				.where(eq(schema.productVariants.productId, existing.id))
				.all();
			variantRows = await this.prepareVariants(db, existing.id, input, slug, new Set(current.map((v) => v.id)));
		}

		let totalStock: number | undefined;
		if (variantRows && variantRows.length > 0) {
			totalStock = variantRows.reduce((sum, v) => sum + v.stock, 0);
		} else if (input.stock !== undefined && input.stock !== null) {
			totalStock = input.stock;
		}

		const lowStockAlert = input.lowStockQty ?? existing.lowStockAlert;
		if (totalStock !== undefined) {
			set.totalStock = totalStock;
			set.stock = totalStock;
			set.inStock = totalStock > 0;
		}
		set.isLowStock = (totalStock ?? existing.totalStock) <= lowStockAlert;

		statements.push(db.update(schema.products).set(set).where(eq(schema.products.id, existing.id)));

		if (variantRows) {
			const keepIds = variantRows.map((v) => v.id);
			statements.push(
				db
					.delete(schema.productVariants)
					.where(
						and(
							eq(schema.productVariants.productId, existing.id),
							keepIds.length > 0 ? notInArray(schema.productVariants.id, keepIds) : undefined
						)
					)
			);
			for (const v of variantRows) {
				const values = {
					name: v.name,
					sku: v.sku,
					price: v.price,
					stock: v.stock,
					openingStock: v.openingStock,
					image: v.image
				};
				statements.push(
					v.isNew
						? db.insert(schema.productVariants).values({ id: v.id, productId: existing.id, ...values })
						: db.update(schema.productVariants).set(values).where(eq(schema.productVariants.id, v.id))
				);
			}
		}

		if (input.specifications) {
			statements.push(db.delete(schema.productSpecs).where(eq(schema.productSpecs.productId, existing.id)));
			input.specifications.forEach((s, index) => {
				statements.push(
					db
						.insert(schema.productSpecs)
						.values({ productId: existing.id, key: s.key, value: s.value, sortOrder: index })
				);
			});
		}

		try {
			await db.batch(statements as [any, ...any[]]);
		} catch (error) {
			translateDbError(error);
		}
		return { success: true, id: existing.id, slug };
	}

	// ---------------------------------------------------------------------------------
	// Delete, status and copy
	// ---------------------------------------------------------------------------------

	/** Landing pages that sell this product. Deleting it would leave them without a price. */
	private static async landingPageCounts(db: Db, productIds: string[]): Promise<Map<string, number>> {
		const counts = new Map<string, number>();
		for (const ids of chunk(productIds)) {
			const rows = await db
				.select({ productId: schema.landingPages.productId, total: sql<number>`count(*)` })
				.from(schema.landingPages)
				.where(inArray(schema.landingPages.productId, ids))
				.groupBy(schema.landingPages.productId)
				.all();
			for (const row of rows) if (row.productId) counts.set(row.productId, Number(row.total));
		}
		return counts;
	}

	/**
	 * Deletes a product. Its reviews, variants and specifications go with it.
	 * Refused while a landing page still sells it.
	 */
	static async deleteProduct(db: Db, id: string) {
		const existing = await db
			.select({ id: schema.products.id, name: schema.products.name })
			.from(schema.products)
			.where(eq(schema.products.id, id))
			.get();
		if (!existing) throw new ProductValidationError('প্রোডাক্টটি পাওয়া যায়নি');

		const used = (await this.landingPageCounts(db, [id])).get(id) ?? 0;
		if (used > 0) {
			throw new ProductValidationError(
				`"${existing.name}" ${used}টি ল্যান্ডিং পেজে ব্যবহৃত হচ্ছে। আগে ল্যান্ডিং পেজ থেকে সরান বা ড্রাফট করুন।`
			);
		}

		await db.delete(schema.products).where(eq(schema.products.id, id));
		return { success: true, deletedId: id };
	}

	/** Deletes many products; ones still used by a landing page are skipped and reported. */
	static async deleteProducts(db: Db, ids: string[]) {
		const unique = [...new Set(ids)].slice(0, MAX_BULK_IDS);
		const blocked = await this.landingPageCounts(db, unique);
		const deletable = unique.filter((id) => !blocked.has(id));

		for (const part of chunk(deletable)) {
			await db.delete(schema.products).where(inArray(schema.products.id, part));
		}
		return { deleted: deletable.length, skipped: unique.length - deletable.length };
	}

	/** Publishes or drafts many products at once. */
	static async setStatus(db: Db, ids: string[], status: 'published' | 'draft') {
		const unique = [...new Set(ids)].slice(0, MAX_BULK_IDS);
		for (const part of chunk(unique)) {
			await db
				.update(schema.products)
				.set({ status, updatedAt: new Date() })
				.where(inArray(schema.products.id, part));
		}
		return { updated: unique.length };
	}

	/**
	 * Toggles product status between 'published' and 'draft'
	 */
	static async toggleProductStatus(db: Db, id: string) {
		const existing = await db.select().from(schema.products).where(eq(schema.products.id, id)).get();
		if (!existing) throw new ProductValidationError('প্রোডাক্টটি পাওয়া যায়নি');

		const nextStatus = existing.status === 'published' ? 'draft' : 'published';
		await db
			.update(schema.products)
			.set({ status: nextStatus, updatedAt: new Date() })
			.where(eq(schema.products.id, id));
		return { success: true, nextStatus };
	}

	/**
	 * Duplicates a product as a draft, together with its specifications and variants
	 */
	static async duplicateProduct(db: Db, id: string) {
		const existing = await db.select().from(schema.products).where(eq(schema.products.id, id)).get();
		if (!existing) throw new ProductValidationError('প্রোডাক্টটি পাওয়া যায়নি');

		const [specs, variants] = await Promise.all([
			db.select().from(schema.productSpecs).where(eq(schema.productSpecs.productId, id)).all(),
			db.select().from(schema.productVariants).where(eq(schema.productVariants.productId, id)).all()
		]);

		const newId = crypto.randomUUID();
		const slug = await this.resolveSlug(db, { name: `${existing.slug}-copy` });
		const copy = {
			...existing,
			id: newId,
			name: `${existing.name} (Copy)`,
			slug,
			status: 'draft',
			salesCount: 0,
			viewCount: 0,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const copySuffix = newId.slice(0, 6).toUpperCase();
		const statements: any[] = [
			db.insert(schema.products).values(copy),
			...specs.map((s) =>
				db.insert(schema.productSpecs).values({ productId: newId, key: s.key, value: s.value, sortOrder: s.sortOrder })
			),
			...variants.map((v) =>
				db.insert(schema.productVariants).values({
					productId: newId,
					name: v.name,
					sku: `${v.sku}-C${copySuffix}`,
					color: v.color,
					size: v.size,
					price: v.price,
					costPrice: v.costPrice,
					stock: v.stock,
					openingStock: v.openingStock,
					image: v.image
				})
			)
		];

		try {
			await db.batch(statements as [any, ...any[]]);
		} catch (error) {
			translateDbError(error);
		}
		return { success: true, duplicatedProduct: copy };
	}
}
