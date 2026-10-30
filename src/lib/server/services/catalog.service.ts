import { eq, and, desc, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface FacebookCatalogSettings {
	isEnabled: boolean;
	includeOutOfStock: boolean;
	catalogMatchKey: 'id' | 'sku';
	currency: string;
	customStoreName?: string;
	updatedAt?: string | number;
}

export const DEFAULT_CATALOG_SETTINGS: FacebookCatalogSettings = {
	// Catalog feed is disabled by default — user must enable it from Dashboard > Settings > Facebook Catalog
	isEnabled: false,
	includeOutOfStock: false,
	catalogMatchKey: 'id',
	currency: 'BDT',
	customStoreName: ''
};

export class CatalogService {
	/**
	 * Strips all HTML tags and collapses spaces for clean Meta text descriptions
	 */
	static cleanDescription(raw?: string | null): string {
		if (!raw) return '';
		return raw
			.replace(/<[^>]*>/g, ' ') // Strip HTML tags
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/\s+/g, ' ')
			.trim();
	}

	/**
	 * Strictly escapes a field for RFC 4180 / Meta CSV compliance
	 */
	static escapeCsv(val: any): string {
		if (val === null || val === undefined) return '""';
		const str = String(val).replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
		// If string contains comma, double quote or space, wrap in quotes and escape internal quotes
		if (str.includes(',') || str.includes('"') || str.includes(' ')) {
			return `"${str.replace(/"/g, '""')}"`;
		}
		return `"${str}"`;
	}

	/**
	 * Retrieves Facebook Catalog Settings from D1 store_settings table
	 */
	static async getSettings(db: DrizzleD1Database<typeof schema>): Promise<FacebookCatalogSettings> {
		try {
			const row = await db
				.select()
				.from(schema.storeSettings)
				.where(and(eq(schema.storeSettings.group, 'tracking'), eq(schema.storeSettings.key, 'facebook_catalog')))
				.get();

			if (!row || !row.value) {
				return DEFAULT_CATALOG_SETTINGS;
			}

			const parsed = JSON.parse(row.value);
			return {
				...DEFAULT_CATALOG_SETTINGS,
				...parsed
			};
		} catch (err) {
			console.error('Failed to get catalog settings:', err);
			return DEFAULT_CATALOG_SETTINGS;
		}
	}

	/**
	 * Saves Facebook Catalog Settings to D1 store_settings table
	 */
	static async saveSettings(
		db: DrizzleD1Database<typeof schema>,
		settings: FacebookCatalogSettings
	): Promise<boolean> {
		try {
			const jsonStr = JSON.stringify({
				...settings,
				updatedAt: new Date().toISOString()
			});

			const existing = await db
				.select()
				.from(schema.storeSettings)
				.where(and(eq(schema.storeSettings.group, 'tracking'), eq(schema.storeSettings.key, 'facebook_catalog')))
				.get();

			if (existing) {
				await db
					.update(schema.storeSettings)
					.set({
						value: jsonStr,
						updatedAt: new Date()
					})
					.where(eq(schema.storeSettings.id, existing.id));
			} else {
				await db.insert(schema.storeSettings).values({
					id: crypto.randomUUID(),
					group: 'tracking',
					key: 'facebook_catalog',
					value: jsonStr,
					updatedAt: new Date()
				});
			}

			return true;
		} catch (err) {
			console.error('Failed to save catalog settings:', err);
			return false;
		}
	}

	/**
	 * Retrieves live catalog product counts for admin diagnostics
	 */
	static async getDiagnostics(db: DrizzleD1Database<typeof schema>): Promise<{
		totalPublished: number;
		inStockCount: number;
		outOfStockCount: number;
	}> {
		try {
			const allPublished = await db
				.select({
					id: schema.products.id,
					inStock: schema.products.inStock,
					totalStock: schema.products.totalStock
				})
				.from(schema.products)
				.where(eq(schema.products.status, 'published'));

			const inStock = allPublished.filter((p) => Boolean(p.inStock) && (p.totalStock ?? 1) > 0);
			const outOfStock = allPublished.filter((p) => !Boolean(p.inStock) || (p.totalStock ?? 0) <= 0);

			return {
				totalPublished: allPublished.length,
				inStockCount: inStock.length,
				outOfStockCount: outOfStock.length
			};
		} catch (err) {
			console.error('Failed to get catalog diagnostics:', err);
			return { totalPublished: 0, inStockCount: 0, outOfStockCount: 0 };
		}
	}

	/**
	 * Generates a Meta-compliant CSV product catalog feed in a fast, single-pass iteration
	 */
	static async generateCsvFeed(db: DrizzleD1Database<typeof schema>, origin: string): Promise<string> {
		const settings = await this.getSettings(db);
		if (!settings.isEnabled) {
			return 'id,title,description,availability,condition,price,link,image_link,brand\n';
		}

		// Fetch published products
		const items = await db
			.select()
			.from(schema.products)
			.where(eq(schema.products.status, 'published'))
			.orderBy(desc(schema.products.id));

		const lines: string[] = [
			'id,title,description,availability,condition,price,link,image_link,brand'
		];

		const storeName = settings.customStoreName || 'AURA Store';
		const currency = settings.currency || 'BDT';

		for (const p of items) {
			const isAvailable = Boolean(p.inStock) && (p.totalStock ?? 1) > 0;
			if (!isAvailable && !settings.includeOutOfStock) {
				continue;
			}

			// 1. Unified ID matching (Aligns with Pixel catalogMatchKey)
			const productId = settings.catalogMatchKey === 'sku' && p.sku ? p.sku : p.id;

			// 2. Title & Description
			const title = p.name ? p.name.trim() : 'Product';
			const descText = this.cleanDescription(p.description || p.tagline || p.name);

			// 3. Availability
			const availability = isAvailable ? 'in stock' : 'out of stock';

			// 4. Price (Must be formatted as '[number].00 [ISO]')
			const effectivePrice = Number(p.salePrice || p.price || 0);
			const formattedPrice = `${effectivePrice.toFixed(2)} ${currency}`;

			// 5. Product Link (Absolute HTTPS URL)
			const link = `${origin}/product/${p.slug || p.id}`;

			// 6. Image Link (Must be absolute)
			let imageLink = p.image || '';
			if (imageLink && !imageLink.startsWith('http')) {
				imageLink = `${origin}${imageLink.startsWith('/') ? '' : '/'}${imageLink}`;
			}
			if (!imageLink) {
				imageLink = `${origin}/favicon.png`;
			}

			// 7. Brand
			const brand = p.category || storeName;

			const row = [
				this.escapeCsv(productId),
				this.escapeCsv(title),
				this.escapeCsv(descText),
				this.escapeCsv(availability),
				this.escapeCsv('new'),
				this.escapeCsv(formattedPrice),
				this.escapeCsv(link),
				this.escapeCsv(imageLink),
				this.escapeCsv(brand)
			].join(',');

			lines.push(row);
		}

		return lines.join('\n');
	}

	/**
	 * Generates a Meta and Google Shopping compliant RSS/XML 2.0 Product Feed
	 */
	static async generateXmlFeed(db: DrizzleD1Database<typeof schema>, origin: string): Promise<string> {
		const settings = await this.getSettings(db);
		const items = await db
			.select()
			.from(schema.products)
			.where(eq(schema.products.status, 'published'))
			.orderBy(desc(schema.products.id));

		const storeName = settings.customStoreName || 'AURA Store';
		const currency = settings.currency || 'BDT';

		let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
		xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
		xml += `  <channel>\n`;
		xml += `    <title>${storeName} Product Catalog</title>\n`;
		xml += `    <link>${origin}</link>\n`;
		xml += `    <description>Live Product Feed for Meta Commerce Manager and Google Shopping</description>\n`;

		for (const p of items) {
			const isAvailable = Boolean(p.inStock) && (p.totalStock ?? 1) > 0;
			if (!isAvailable && !settings.includeOutOfStock) {
				continue;
			}

			const productId = settings.catalogMatchKey === 'sku' && p.sku ? p.sku : p.id;
			const title = (p.name || 'Product').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			const descText = this.cleanDescription(p.description || p.tagline || p.name)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');

			const availability = isAvailable ? 'in stock' : 'out of stock';
			const effectivePrice = Number(p.salePrice || p.price || 0);
			const formattedPrice = `${effectivePrice.toFixed(2)} ${currency}`;
			const link = `${origin}/product/${p.slug || p.id}`;

			let imageLink = p.image || '';
			if (imageLink && !imageLink.startsWith('http')) {
				imageLink = `${origin}${imageLink.startsWith('/') ? '' : '/'}${imageLink}`;
			}
			if (!imageLink) imageLink = `${origin}/favicon.png`;

			const brand = (p.category || storeName).replace(/&/g, '&amp;');

			xml += `    <item>\n`;
			xml += `      <g:id>${productId}</g:id>\n`;
			xml += `      <g:title>${title}</g:title>\n`;
			xml += `      <g:description>${descText}</g:description>\n`;
			xml += `      <g:link>${link}</g:link>\n`;
			xml += `      <g:image_link>${imageLink}</g:image_link>\n`;
			xml += `      <g:brand>${brand}</g:brand>\n`;
			xml += `      <g:condition>new</g:condition>\n`;
			xml += `      <g:availability>${availability}</g:availability>\n`;
			xml += `      <g:price>${formattedPrice}</g:price>\n`;
			xml += `    </item>\n`;
		}

		xml += `  </channel>\n`;
		xml += `</rss>\n`;

		return xml;
	}
}

