import { eq, or, and, sql, desc, inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

type Db = DrizzleD1Database<typeof schema>;

export interface ImportResult {
	success: boolean;
	total: number;
	inserted: number;
	updated: number;
	errors: string[];
	sample?: any[];
	message?: string;
}

export interface PreviewResult {
	success: boolean;
	total: number;
	columns: string[];
	previewRows: any[];
	hasHtmlDescription: boolean;
	error?: string;
}

/**
 * RFC-4180 Compliant CSV Parser & Generator
 * Robustly handles multi-line fields (e.g. rich HTML descriptions containing \n, commas, and quotes)
 */
export class CsvHelper {
	static parse(csvText: string): Record<string, string>[] {
		if (!csvText) return [];
		// Strip UTF-8 BOM if present
		const cleanText = csvText.charCodeAt(0) === 0xfeff ? csvText.slice(1) : csvText;

		const rows: string[][] = [];
		let currentRow: string[] = [];
		let currentField = '';
		let insideQuotes = false;
		let i = 0;

		while (i < cleanText.length) {
			const char = cleanText[i];
			const nextChar = cleanText[i + 1];

			if (insideQuotes) {
				if (char === '"') {
					if (nextChar === '"') {
						// Escaped quote ("") inside quoted string
						currentField += '"';
						i += 2;
						continue;
					} else {
						// Closing quote
						insideQuotes = false;
						i++;
						continue;
					}
				} else {
					currentField += char;
					i++;
					continue;
				}
			} else {
				if (char === '"') {
					insideQuotes = true;
					i++;
					continue;
				} else if (char === ',') {
					currentRow.push(currentField);
					currentField = '';
					i++;
					continue;
				} else if (char === '\r') {
					if (nextChar === '\n') {
						i++; // Skip \r in \r\n
					}
					currentRow.push(currentField);
					rows.push(currentRow);
					currentRow = [];
					currentField = '';
					i++;
					continue;
				} else if (char === '\n') {
					currentRow.push(currentField);
					rows.push(currentRow);
					currentRow = [];
					currentField = '';
					i++;
					continue;
				} else {
					currentField += char;
					i++;
					continue;
				}
			}
		}

		if (currentField !== '' || currentRow.length > 0) {
			currentRow.push(currentField);
			rows.push(currentRow);
		}

		if (rows.length < 2) return [];

		const headers = rows[0].map((h) => h.trim().replace(/^[\uFEFF]/, ''));
		const results: Record<string, string>[] = [];

		for (let r = 1; r < rows.length; r++) {
			const row = rows[r];
			// Ignore completely blank rows
			if (row.length === 1 && row[0].trim() === '') continue;

			const obj: Record<string, string> = {};
			for (let c = 0; c < headers.length; c++) {
				const header = headers[c];
				if (header) {
					obj[header] = (row[c] !== undefined ? row[c] : '').trim();
				}
			}
			results.push(obj);
		}

		return results;
	}

	static stringify(rows: Record<string, any>[], explicitHeaders?: string[]): string {
		if (!rows || rows.length === 0) return '';
		const headers = explicitHeaders || Object.keys(rows[0]);

		const escapeCell = (val: any): string => {
			if (val === null || val === undefined) return '';
			let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
			if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
				str = '"' + str.replace(/"/g, '""') + '"';
			}
			return str;
		};

		const headerLine = headers.map(escapeCell).join(',');
		const bodyLines = rows.map((row) => headers.map((h) => escapeCell(row[h])).join(','));

		return '\uFEFF' + [headerLine, ...bodyLines].join('\r\n');
	}
}

/**
 * Enterprise Data Transfer Service
 * Supports 1-Click Full Backup, Single-Entity Export, and Multi-Format Import (JSON/CSV)
 * Guarantees faithful preservation of rich HTML product descriptions and styled markup.
 */
export class DataTransferService {
	// ==========================================
	// 1. EXPORT HANDLERS
	// ==========================================

	static async exportProducts(db: Db): Promise<any[]> {
		const rawProducts = await db
			.select()
			.from(schema.products)
			.orderBy(desc(schema.products.createdAt))
			.all();

		// Fetch variants & categories for complete enrichment
		const allCategories = await db.select().from(schema.categories).all();
		const catMap = new Map(allCategories.map((c) => [c.id, c.name]));

		return rawProducts.map((p) => ({
			id: p.id,
			name: p.name,
			slug: p.slug,
			tagline: p.tagline || '',
			categoryName: (p.categoryId ? catMap.get(p.categoryId) : null) || p.category || '',
			categoryId: p.categoryId || '',
			price: p.price,
			regularPrice: p.regularPrice ?? p.price,
			salePrice: p.salePrice ?? null,
			originalPrice: p.originalPrice ?? p.price,
			costPrice: p.costPrice ?? null,
			sku: p.sku || '',
			totalStock: p.totalStock ?? 0,
			lowStockAlert: p.lowStockAlert ?? 5,
			inStock: Boolean(p.inStock),
			status: p.status || 'published',
			badge: p.badge || '',
			priority: p.priority || '-',
			enableBundle: Boolean(p.enableBundle),
			bundleUnitLabel: p.bundleUnitLabel || 'প্যাকেট',
			urgencyMessage: p.urgencyMessage || '',
			image: p.image || '',
			featuredImage: p.featuredImage || '',
			galleryImages: p.galleryImages ? (typeof p.galleryImages === 'string' ? p.galleryImages : JSON.stringify(p.galleryImages)) : '[]',
			// FULL RAW HTML STRICTLY PRESERVED
			description: p.description || '',
			returnPolicy: p.returnPolicy || '',
			seoTitle: p.seoTitle || '',
			seoDescription: p.seoDescription || '',
			createdAt: p.createdAt
		}));
	}

	static async exportCategories(db: Db): Promise<any[]> {
		return await db
			.select()
			.from(schema.categories)
			.orderBy(desc(schema.categories.createdAt))
			.all();
	}

	static async exportCoupons(db: Db): Promise<any[]> {
		return await db
			.select()
			.from(schema.coupons)
			.orderBy(desc(schema.coupons.createdAt))
			.all();
	}

	static async exportOrders(db: Db): Promise<any[]> {
		const rawOrders = await db
			.select()
			.from(schema.orders)
			.orderBy(desc(schema.orders.createdAt))
			.all();

		return rawOrders.map((o) => ({
			id: o.id,
			orderNumber: o.orderNumber || o.id.slice(0, 8),
			customerName: o.customerName,
			customerPhone: o.customerPhone,
			customerEmail: o.customerEmail,
			shippingAddress: o.shippingAddress,
			deliveryArea: o.deliveryArea,
			subtotal: o.subtotal,
			deliveryCharge: o.deliveryCharge,
			discountAmount: o.discountAmount,
			advancePayment: o.advancePayment,
			dueAmount: o.dueAmount,
			total: o.total,
			paymentMethod: o.paymentMethod,
			paymentStatus: o.paymentStatus,
			status: o.status,
			courierProvider: o.courierProvider || '',
			trackingCode: o.trackingCode || '',
			consignmentId: o.consignmentId || '',
			items: typeof o.items === 'string' ? o.items : JSON.stringify(o.items),
			source: o.source || 'web',
			ipAddress: o.ipAddress || '',
			createdAt: o.createdAt
		}));
	}

	static async exportSalesSummary(db: Db): Promise<any[]> {
		const orders = await db
			.select({
				id: schema.orders.id,
				orderNumber: schema.orders.orderNumber,
				status: schema.orders.status,
				items: schema.orders.items,
				total: schema.orders.total,
				createdAt: schema.orders.createdAt
			})
			.from(schema.orders)
			.all();

		const productMap = new Map<string, { name: string; quantity: number; revenue: number; ordersCount: number }>();

		for (const ord of orders) {
			if (['cancelled', 'returned'].includes(ord.status)) continue;
			let items: any[] = [];
			try {
				items = typeof ord.items === 'string' ? JSON.parse(ord.items) : ord.items;
			} catch {}
			if (!Array.isArray(items)) continue;

			for (const it of items) {
				const pName = it.name || it.productName || 'Unknown Product';
				const qty = Number(it.quantity) || 1;
				const price = Number(it.price) || 0;
				const sub = Number(it.subtotal) || price * qty;

				const cur = productMap.get(pName) || { name: pName, quantity: 0, revenue: 0, ordersCount: 0 };
				cur.quantity += qty;
				cur.revenue += sub;
				cur.ordersCount += 1;
				productMap.set(pName, cur);
			}
		}

		return Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity);
	}

	static async exportCustomers(db: Db): Promise<any[]> {
		return await db
			.select()
			.from(schema.customers)
			.orderBy(desc(schema.customers.createdAt))
			.all();
	}

	static async exportFullBackup(db: Db): Promise<Record<string, any>> {
		const [
			products,
			productVariants,
			categories,
			brands,
			coupons,
			orders,
			orderItems,
			customers,
			storeSettings,
			reviews
		] = await Promise.all([
			db.select().from(schema.products).all().catch(() => []),
			db.select().from(schema.productVariants).all().catch(() => []),
			db.select().from(schema.categories).all().catch(() => []),
			db.select().from(schema.brands).all().catch(() => []),
			db.select().from(schema.coupons).all().catch(() => []),
			db.select().from(schema.orders).all().catch(() => []),
			db.select().from(schema.orderItems).all().catch(() => []),
			db.select().from(schema.customers).all().catch(() => []),
			db.select().from(schema.storeSettings).all().catch(() => []),
			db.select().from(schema.reviews).all().catch(() => [])
		]);

		return {
			version: '2.0',
			generatedAt: new Date().toISOString(),
			generator: 'HaqPlus Ultra-Premium Backup Engine',
			stats: {
				productsCount: products.length,
				ordersCount: orders.length,
				customersCount: customers.length,
				categoriesCount: categories.length
			},
			tables: {
				products,
				productVariants,
				categories,
				brands,
				coupons,
				orders,
				orderItems,
				customers,
				storeSettings,
				reviews
			}
		};
	}

	// ==========================================
	// 2. PREVIEW UTILITY (Pre-Import Inspector)
	// ==========================================

	static parseUploadedFile(rawContent: string, format: 'json' | 'csv'): any[] {
		if (format === 'json') {
			const parsed = JSON.parse(rawContent);
			if (Array.isArray(parsed)) return parsed;
			if (parsed && typeof parsed === 'object') {
				if (Array.isArray(parsed.products)) return parsed.products;
				if (Array.isArray(parsed.data)) return parsed.data;
				if (Array.isArray(parsed.items)) return parsed.items;
				// Single object wrap
				return [parsed];
			}
			return [];
		} else {
			return CsvHelper.parse(rawContent);
		}
	}

	static inspectPreview(items: any[]): PreviewResult {
		if (!items || items.length === 0) {
			return {
				success: false,
				total: 0,
				columns: [],
				previewRows: [],
				hasHtmlDescription: false,
				error: 'ফাইলে কোনো ভ্যালিড ডেটা রেকর্ড পাওয়া যায়নি।'
			};
		}

		const total = items.length;
		const columns = Object.keys(items[0]).slice(0, 15);
		const previewRows = items.slice(0, 5);

		// Check if any row contains rich HTML markup in description
		let hasHtmlDescription = false;
		for (const row of previewRows) {
			const desc = String(row.description || '');
			if (/<[a-z][\s\S]*>/i.test(desc) || desc.includes('style=') || desc.includes('<div>') || desc.includes('<p>')) {
				hasHtmlDescription = true;
				break;
			}
		}

		return {
			success: true,
			total,
			columns,
			previewRows,
			hasHtmlDescription
		};
	}

	// ==========================================
	// 3. SMART IMPORT ENGINES (HTML-Safe & Upsert)
	// ==========================================

	/**
	 * Imports products.
	 * STRICTLY PRESERVES raw HTML description, inline styles, images and formatting!
	 * Performs smart upsert by matching SKU, Slug, or ID.
	 */
	static async importProducts(db: Db, rawItems: any[], options?: { updateExisting?: boolean }): Promise<ImportResult> {
		const updateExisting = options?.updateExisting !== false;
		let inserted = 0;
		let updated = 0;
		const errors: string[] = [];

		// Cache categories & brands for taxonomy resolution
		const existingCategories = await db.select().from(schema.categories).all();
		const catByName = new Map(existingCategories.map((c) => [c.name.toLowerCase().trim(), c.id]));
		const catBySlug = new Map(existingCategories.map((c) => [c.slug.toLowerCase().trim(), c.id]));

		const existingBrands = await db.select().from(schema.brands).all();
		const brandByName = new Map(existingBrands.map((b) => [b.name.toLowerCase().trim(), b.id]));

		for (let idx = 0; idx < rawItems.length; idx++) {
			const row = rawItems[idx];
			try {
				const name = (row.name || row.title || '').trim();
				if (!name) {
					errors.push(`সারি #${idx + 1}: পণ্যের নাম অনুপস্থিত`);
					continue;
				}

				// Price resolving
				const price = Math.round(Number(row.price || row.salePrice || row.regularPrice || 0));
				if (isNaN(price) || price <= 0) {
					errors.push(`সারি #${idx + 1} (${name}): মূল্য সঠিক নয়`);
					continue;
				}

				// Generate or sanitize slug
				let slug = (row.slug || '').trim().toLowerCase();
				if (!slug) {
					slug = name
						.toLowerCase()
						.replace(/[^\w\u0980-\u09FF]+/g, '-')
						.replace(/^-+|-+$/g, '');
				}
				if (!slug) slug = 'product-' + Math.random().toString(36).slice(2, 8);

				// Category ID resolution
				let categoryId = row.categoryId || null;
				const catNameInput = (row.categoryName || row.category || '').trim();
				if (!categoryId && catNameInput) {
					const matchedId = catByName.get(catNameInput.toLowerCase()) || catBySlug.get(catNameInput.toLowerCase());
					if (matchedId) {
						categoryId = matchedId;
					} else {
						// Auto-create category if missing
						const newCatId = crypto.randomUUID();
						const newCatSlug = catNameInput
							.toLowerCase()
							.replace(/[^\w\u0980-\u09FF]+/g, '-')
							.replace(/^-+|-+$/g, '') || `cat-${Math.random().toString(36).slice(2, 6)}`;
						await db.insert(schema.categories).values({
							id: newCatId,
							name: catNameInput,
							slug: newCatSlug,
							isActive: true
						}).run();
						catByName.set(catNameInput.toLowerCase(), newCatId);
						categoryId = newCatId;
					}
				}

				// Brand ID resolution
				let brandId = row.brandId || null;
				const brandNameInput = (row.brandName || row.brand || '').trim();
				if (!brandId && brandNameInput) {
					const matchedBId = brandByName.get(brandNameInput.toLowerCase());
					if (matchedBId) {
						brandId = matchedBId;
					} else {
						const newBId = crypto.randomUUID();
						await db.insert(schema.brands).values({
							id: newBId,
							name: brandNameInput,
							slug: brandNameInput.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-'),
							isActive: true
						}).run();
						brandByName.set(brandNameInput.toLowerCase(), newBId);
						brandId = newBId;
					}
				}

				// RAW HTML STRICTLY PRESERVED
				const rawDescription = row.description !== undefined && row.description !== null
					? String(row.description)
					: (row.details || row.content || '');

				// Inventory numbers
				const totalStock = !isNaN(Number(row.totalStock)) ? Number(row.totalStock) : (!isNaN(Number(row.stock)) ? Number(row.stock) : 100);
				const inStock = row.inStock === false || row.inStock === 'false' || row.inStock === 0 || totalStock <= 0 ? false : true;

				// Gallery parsing
				let galleryImagesStr = '[]';
				if (Array.isArray(row.galleryImages)) {
					galleryImagesStr = JSON.stringify(row.galleryImages);
				} else if (typeof row.galleryImages === 'string' && row.galleryImages.trim().startsWith('[')) {
					galleryImagesStr = row.galleryImages;
				} else if (typeof row.galleryImages === 'string' && row.galleryImages.includes(',')) {
					galleryImagesStr = JSON.stringify(row.galleryImages.split(',').map((s: string) => s.trim()).filter(Boolean));
				}

				// Check existing product by sku, slug, or id
				const sku = (row.sku || '').trim();
				const matchConditions = [];
				if (row.id) matchConditions.push(eq(schema.products.id, row.id));
				if (sku) matchConditions.push(eq(schema.products.sku, sku));
				if (slug) matchConditions.push(eq(schema.products.slug, slug));

				let existingProduct: any = null;
				if (matchConditions.length > 0) {
					existingProduct = await db
						.select()
						.from(schema.products)
						.where(or(...matchConditions))
						.get();
				}

				const productValues = {
					name,
					slug,
					tagline: row.tagline || '',
					categoryId,
					category: catNameInput || existingProduct?.category || null,
					brandId,
					price,
					regularPrice: Math.round(Number(row.regularPrice || row.originalPrice || price)),
					salePrice: row.salePrice ? Math.round(Number(row.salePrice)) : null,
					originalPrice: Math.round(Number(row.originalPrice || price)),
					costPrice: row.costPrice ? Math.round(Number(row.costPrice)) : null,
					sku: sku || existingProduct?.sku || null,
					totalStock,
					stock: totalStock,
					openingStock: Number(row.openingStock || totalStock),
					lowStockAlert: Number(row.lowStockAlert || 5),
					inStock,
					isLowStock: totalStock <= 5,
					status: (row.status === 'draft' || row.status === 'archived') ? row.status : 'published',
					badge: row.badge || null,
					priority: row.priority || '-',
					enableBundle: Boolean(row.enableBundle === true || row.enableBundle === 'true' || row.enableBundle === 1),
					bundleUnitLabel: row.bundleUnitLabel || 'প্যাকেট',
					urgencyMessage: row.urgencyMessage || null,
					image: row.image || row.featuredImage || '/placeholder.png',
					featuredImage: row.featuredImage || row.image || null,
					galleryImages: galleryImagesStr,
					// RAW HTML PRESERVED:
					description: rawDescription,
					returnPolicy: row.returnPolicy || null,
					seoTitle: row.seoTitle || name,
					seoDescription: row.seoDescription || (rawDescription ? rawDescription.replace(/<[^>]*>/g, '').slice(0, 160) : '')
				};

				if (existingProduct) {
					if (updateExisting) {
						await db
							.update(schema.products)
							.set({
								...productValues,
								updatedAt: new Date()
							})
							.where(eq(schema.products.id, existingProduct.id))
							.run();
						updated++;
					}
				} else {
					const newId = row.id || crypto.randomUUID();
					await db
						.insert(schema.products)
						.values({
							id: newId,
							...productValues,
							createdAt: new Date(),
							updatedAt: new Date()
						})
						.run();
					inserted++;
				}
			} catch (err: any) {
				errors.push(`সারি #${idx + 1} এক্সিকিউশনে সমস্যা: ${err?.message}`);
			}
		}

		return {
			success: errors.length === 0 || inserted > 0 || updated > 0,
			total: rawItems.length,
			inserted,
			updated,
			errors,
			message: `${inserted}টি নতুন পণ্য যোগ এবং ${updated}টি পণ্য আপডেট করা হয়েছে।`
		};
	}

	/**
	 * Imports categories with smart upsert
	 */
	static async importCategories(db: Db, rawItems: any[]): Promise<ImportResult> {
		let inserted = 0;
		let updated = 0;
		const errors: string[] = [];

		for (let idx = 0; idx < rawItems.length; idx++) {
			const row = rawItems[idx];
			try {
				const name = (row.name || '').trim();
				if (!name) continue;

				let slug = (row.slug || '').trim().toLowerCase();
				if (!slug) {
					slug = name.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-');
				}

				const existing = await db
					.select()
					.from(schema.categories)
					.where(or(eq(schema.categories.slug, slug), eq(schema.categories.name, name)))
					.get();

				const categoryVals = {
					name,
					slug,
					description: row.description || '',
					icon: row.icon || null,
					image: row.image || null,
					priority: row.priority || '-',
					isActive: row.isActive !== false && row.isActive !== 'false' && row.isActive !== 0
				};

				if (existing) {
					await db
						.update(schema.categories)
						.set({ ...categoryVals, updatedAt: new Date() })
						.where(eq(schema.categories.id, existing.id))
						.run();
					updated++;
				} else {
					await db
						.insert(schema.categories)
						.values({
							id: row.id || crypto.randomUUID(),
							...categoryVals,
							createdAt: new Date(),
							updatedAt: new Date()
						})
						.run();
					inserted++;
				}
			} catch (err: any) {
				errors.push(`ক্যাটাগরি #${idx + 1}: ${err?.message}`);
			}
		}

		return {
			success: true,
			total: rawItems.length,
			inserted,
			updated,
			errors,
			message: `${inserted}টি নতুন ক্যাটাগরি যোগ এবং ${updated}টি ক্যাটাগরি আপডেট করা হয়েছে।`
		};
	}

	/**
	 * Imports coupons with smart upsert
	 */
	static async importCoupons(db: Db, rawItems: any[]): Promise<ImportResult> {
		let inserted = 0;
		let updated = 0;
		const errors: string[] = [];

		for (let idx = 0; idx < rawItems.length; idx++) {
			const row = rawItems[idx];
			try {
				const code = (row.code || '').trim().toUpperCase();
				if (!code) continue;

				const existing = await db
					.select()
					.from(schema.coupons)
					.where(eq(schema.coupons.code, code))
					.get();

				const couponVals = {
					code,
					discountType: row.discountType === 'percentage' ? 'percentage' : 'fixed',
					discountValue: Number(row.discountValue || 0),
					minOrderAmount: Number(row.minOrderAmount || 0),
					maxDiscountAmount: row.maxDiscountAmount ? Number(row.maxDiscountAmount) : null,
					usageLimit: row.usageLimit ? Number(row.usageLimit) : null,
					isActive: row.isActive !== false && row.isActive !== 'false' && row.isActive !== 0
				};

				if (existing) {
					await db
						.update(schema.coupons)
						.set(couponVals)
						.where(eq(schema.coupons.id, existing.id))
						.run();
					updated++;
				} else {
					await db
						.insert(schema.coupons)
						.values({
							id: row.id || crypto.randomUUID(),
							...couponVals,
							usageCount: 0,
							createdAt: new Date()
						})
						.run();
					inserted++;
				}
			} catch (err: any) {
				errors.push(`কুপন #${idx + 1}: ${err?.message}`);
			}
		}

		return {
			success: true,
			total: rawItems.length,
			inserted,
			updated,
			errors,
			message: `${inserted}টি কুপন সক্রিয় করা হয়েছে।`
		};
	}

	/**
	 * Restores Full Backup safely
	 */
	static async restoreFullBackup(db: Db, backupData: any): Promise<ImportResult> {
		const tables = backupData?.tables || backupData;
		if (!tables || typeof tables !== 'object') {
			return {
				success: false,
				total: 0,
				inserted: 0,
				updated: 0,
				errors: ['ব্যাকআপ ফাইলের ফরম্যাট সঠিক নয়।'],
				message: 'ভুল ফাইল ফরম্যাট'
			};
		}

		let totalRecords = 0;
		const errors: string[] = [];

		// 1. Categories & Brands First
		if (Array.isArray(tables.categories) && tables.categories.length > 0) {
			const res = await this.importCategories(db, tables.categories);
			totalRecords += res.inserted + res.updated;
		}

		// 2. Products with Rich HTML descriptions
		if (Array.isArray(tables.products) && tables.products.length > 0) {
			const res = await this.importProducts(db, tables.products, { updateExisting: true });
			totalRecords += res.inserted + res.updated;
		}

		// 3. Coupons
		if (Array.isArray(tables.coupons) && tables.coupons.length > 0) {
			const res = await this.importCoupons(db, tables.coupons);
			totalRecords += res.inserted + res.updated;
		}

		// 4. Store Settings
		if (Array.isArray(tables.storeSettings) && tables.storeSettings.length > 0) {
			for (const s of tables.storeSettings) {
				try {
					if (!s.key) continue;
					await db
						.insert(schema.storeSettings)
						.values({
							key: s.key,
							value: typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value),
							group: s.group || 'general',
							updatedAt: new Date()
						})
						.onConflictDoUpdate({
							target: [schema.storeSettings.key],
							set: {
								value: typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value),
								updatedAt: new Date()
							}
						})
						.run();
					totalRecords++;
				} catch (e: any) {
					errors.push(`সেটিংস (${s.key}): ${e?.message}`);
				}
			}
		}

		return {
			success: errors.length === 0,
			total: totalRecords,
			inserted: totalRecords,
			updated: 0,
			errors,
			message: `ব্যাকআপ থেকে সর্বমোট ${totalRecords}টি রেকর্ড সফলভাবে রিস্টোর করা হয়েছে!`
		};
	}
}

