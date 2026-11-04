import { eq, desc, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { slugify } from '#lib/utils/slug';

export interface Style2Package {
	id?: string;
	title: string;
	subtitle?: string;
	freeGift?: string;
	qty?: number;
	price: number;
	originalPrice?: number;
	deliveryFee?: number;
	freeDelivery?: boolean;
	tag?: string;
	popular?: boolean;
}

export interface LandingPageContent {
	headline?: string;
	subheadline?: string;
	offerBadge?: string;
	countdownMinutes?: number;
	bulletPoints?: string[];
	packages?: Style2Package[];
	features?: Array<{ title: string; desc: string; icon?: string }>;
	customPrice?: number;
	customOriginalPrice?: number;
	guaranteeText?: string;
	trustBox1Title?: string;
	trustBox1Desc?: string;
	trustBox2Title?: string;
	trustBox2Desc?: string;
	contactPhone?: string;
	bannerImage?: string;
	galleryImages?: string[];
}

export interface CreateLandingInput {
	title: string;
	slug: string;
	productId?: string | null;
	sku?: string;
	tag?: string;
	category?: string;
	status?: 'Published' | 'Draft' | 'Archived';
	template?: string;
	headline?: string;
	subheadline?: string;
	offerBadge?: string;
	countdownMinutes?: number;
	bulletPoints?: string[];
	packages?: Style2Package[];
	trustBox1Title?: string;
	trustBox1Desc?: string;
	trustBox2Title?: string;
	trustBox2Desc?: string;
	contactPhone?: string;
	features?: Array<{ title: string; desc: string }>;
	customPrice?: number;
	customOriginalPrice?: number;
	galleryImages?: string[];
}

// ─── Shared helpers ───────────────────────────────────────────────

/** Parse the JSON config stored in metaDescription, or build a minimal fallback. */
function parseConfig(landing: { title: string; metaDescription: string | null; tag: string | null }): LandingPageContent {
	try {
		if (landing.metaDescription?.startsWith('{')) {
			return JSON.parse(landing.metaDescription);
		}
	} catch { /* fall through */ }
	return {
		headline: landing.title,
		subheadline: landing.metaDescription || '',
		offerBadge: landing.tag || 'স্পেশাল অফার'
	};
}

/** Extract product gallery images from the joined product row. */
function extractProductImages(product: any): string[] {
	if (!product) return [];
	let images: string[] = [];
	if (product.galleryImages) {
		try {
			const gallery = JSON.parse(product.galleryImages);
			if (Array.isArray(gallery)) images = gallery;
		} catch { /* ignore */ }
	}
	if (images.length === 0 && product.image) {
		images = [product.image];
	}
	return images;
}

/** Shape a raw DB row into the public landing page object. */
function shapeRow(landing: any, product: any) {
	return {
		...landing,
		product: product ? { ...product, parsedImages: extractProductImages(product) } : null,
		config: parseConfig(landing),
		url: `/lp/${landing.slug}`
	};
}

export class LandingPageService {
	/**
	 * Lists all landing pages with their associated product details.
	 */
	static async listLandingPages(db: DrizzleD1Database<typeof schema>) {
		let rows: any[] = [];
		try {
			rows = await db
				.select({
					landing: schema.landingPages,
					product: schema.products
				})
				.from(schema.landingPages)
				.leftJoin(schema.products, eq(schema.landingPages.productId, schema.products.id))
				.orderBy(desc(schema.landingPages.createdAt))
				.all();
		} catch (e) {
			console.error('Error fetching landing pages from DB:', e);
		}

		if (rows.length === 0) return [];
		return rows.map(({ landing, product }) => shapeRow(landing, product));
	}

	/**
	 * Retrieves a landing page by slug (does NOT increment views — call `incrementViews` separately).
	 */
	static async getLandingPageBySlug(db: DrizzleD1Database<typeof schema>, slug: string) {
		const row = await db
			.select({
				landing: schema.landingPages,
				product: schema.products
			})
			.from(schema.landingPages)
			.leftJoin(schema.products, eq(schema.landingPages.productId, schema.products.id))
			.where(eq(schema.landingPages.slug, slug))
			.get();

		if (!row) return null;
		return shapeRow(row.landing, row.product);
	}

	/**
	 * Atomically increment the view counter. Uses SQL `views + 1` to avoid
	 * race conditions, and sets updatedAt to its own column value so the
	 * Drizzle $onUpdate trigger does not bump the timestamp on a mere view.
	 */
	static async incrementViews(db: DrizzleD1Database<typeof schema>, id: string) {
		try {
			await db
				.update(schema.landingPages)
				.set({
					views: sql`${schema.landingPages.views} + 1`,
					updatedAt: sql`${schema.landingPages.updatedAt}`
				} as any)
				.where(eq(schema.landingPages.id, id));
		} catch (e) {
			console.error('Failed to update landing page views:', e);
		}
	}

	/**
	 * Atomically increment the conversion counter.
	 */
	static async incrementConversions(db: DrizzleD1Database<typeof schema>, id: string) {
		try {
			await db
				.update(schema.landingPages)
				.set({
					conversions: sql`${schema.landingPages.conversions} + 1`,
					updatedAt: sql`${schema.landingPages.updatedAt}`
				} as any)
				.where(eq(schema.landingPages.id, id));
		} catch (e) {
			console.error('Failed to update landing page conversions:', e);
		}
	}

	/**
	 * Creates a new custom landing page.
	 */
	static async createLandingPage(db: DrizzleD1Database<typeof schema>, input: CreateLandingInput) {
		const configData: LandingPageContent = {
			headline: input.headline || input.title,
			subheadline: input.subheadline || '',
			offerBadge: input.offerBadge || input.tag || 'সীমিত সময়ের অফার',
			countdownMinutes: input.countdownMinutes || 45,
			bulletPoints: input.bulletPoints || [
				'১০০% প্রিমিয়াম কোয়ালিটি গ্যারান্টি',
				'সরাসরি ক্যাশ অন ডেলিভারি সুবিধা',
				'পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ',
				'সারাদেশে দ্রুততম হোম ডেলিভারি'
			],
			packages: input.packages || undefined,
			trustBox1Title: input.trustBox1Title,
			trustBox1Desc: input.trustBox1Desc,
			trustBox2Title: input.trustBox2Title,
			trustBox2Desc: input.trustBox2Desc,
			contactPhone: input.contactPhone,
			features: input.features || [
				{ title: 'দ্রুত ডেলিভারি', desc: '২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি' },
				{ title: 'মানসম্মত পণ্য', desc: 'অরিজিনাল এবং প্রিমিয়াম উপাদান' },
				{ title: 'সহজ রিটার্ন', desc: 'কোনো সমস্যা হলে তাৎক্ষণিক সাপোর্ট' }
			],
			customPrice: input.customPrice,
			customOriginalPrice: input.customOriginalPrice,
			galleryImages: input.galleryImages || []
		};

		// Use the shared Unicode-safe slugify; fall back to a timestamp slug
		const cleanSlug = slugify(input.slug) || slugify(input.title) || `offer-${Date.now()}`;

		const id = crypto.randomUUID();

		await db.insert(schema.landingPages).values({
			id,
			title: input.title,
			slug: cleanSlug,
			productId: input.productId || null,
			sku: input.sku || `LP-${Math.floor(1000 + Math.random() * 9000)}`,
			tag: input.tag || 'জনপ্রিয় পেজ',
			category: input.category || 'General',
			status: input.status || 'Published',
			template: input.template || 'style_1_animated',
			livePath: `/lp/${cleanSlug}`,
			metaTitle: input.title,
			metaDescription: JSON.stringify(configData),
			views: 0,
			conversions: 0,
			conversionRate: '0%'
		});

		return { id, slug: cleanSlug };
	}

	/**
	 * Retrieves a landing page by ID.
	 */
	static async getLandingPageById(db: DrizzleD1Database<typeof schema>, id: string) {
		const row = await db
			.select({
				landing: schema.landingPages,
				product: schema.products
			})
			.from(schema.landingPages)
			.leftJoin(schema.products, eq(schema.landingPages.productId, schema.products.id))
			.where(eq(schema.landingPages.id, id))
			.get();

		if (!row) return null;
		return shapeRow(row.landing, row.product);
	}

	/**
	 * Updates an existing landing page. Replaces the config wholesale with the
	 * supplied fields — the caller sends the full state, not a diff.
	 */
	static async updateLandingPage(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		input: Partial<CreateLandingInput>
	) {
		const existing = await this.getLandingPageById(db, id);
		if (!existing) throw new Error('ল্যান্ডিং পেজ পাওয়া যায়নি');

		// Build a fresh config from the submitted input, falling back to
		// existing values only for fields the caller truly omitted.
		const newConfig: LandingPageContent = {
			headline: input.headline ?? existing.config.headline,
			subheadline: input.subheadline ?? existing.config.subheadline,
			offerBadge: input.offerBadge ?? existing.config.offerBadge,
			countdownMinutes: input.countdownMinutes ?? existing.config.countdownMinutes,
			bulletPoints: input.bulletPoints ?? existing.config.bulletPoints,
			packages: input.packages ?? existing.config.packages,
			trustBox1Title: input.trustBox1Title ?? existing.config.trustBox1Title,
			trustBox1Desc: input.trustBox1Desc ?? existing.config.trustBox1Desc,
			trustBox2Title: input.trustBox2Title ?? existing.config.trustBox2Title,
			trustBox2Desc: input.trustBox2Desc ?? existing.config.trustBox2Desc,
			contactPhone: input.contactPhone ?? existing.config.contactPhone,
			customPrice: input.customPrice ?? existing.config.customPrice,
			customOriginalPrice: input.customOriginalPrice ?? existing.config.customOriginalPrice,
			galleryImages: input.galleryImages ?? existing.config.galleryImages ?? []
		};

		const cleanSlug = input.slug
			? slugify(input.slug) || existing.slug
			: existing.slug;

		await db
			.update(schema.landingPages)
			.set({
				title: input.title || existing.title,
				slug: cleanSlug,
				productId: input.productId !== undefined ? input.productId : existing.productId,
				tag: input.tag || existing.tag,
				template: input.template || existing.template,
				status: input.status || existing.status,
				livePath: `/lp/${cleanSlug}`,
				metaTitle: input.title || existing.title,
				metaDescription: JSON.stringify(newConfig)
			})
			.where(eq(schema.landingPages.id, id));

		return { id, slug: cleanSlug };
	}

	/**
	 * Deletes a landing page by ID.
	 */
	static async deleteLandingPage(db: DrizzleD1Database<typeof schema>, id: string) {
		await db.delete(schema.landingPages).where(eq(schema.landingPages.id, id));
		return { success: true };
	}

	/**
	 * Duplicates an existing landing page with a new slug.
	 */
	static async duplicateLandingPage(db: DrizzleD1Database<typeof schema>, sourceId: string) {
		const source = await this.getLandingPageById(db, sourceId);
		if (!source) throw new Error('ল্যান্ডিং পেজ পাওয়া যায়নি');

		const newSlug = `${source.slug}-copy-${Date.now().toString(36)}`;
		return this.createLandingPage(db, {
			title: `${source.title} (কপি)`,
			slug: newSlug,
			productId: source.productId,
			tag: source.tag || undefined,
			template: source.template || undefined,
			status: 'Draft',
			headline: source.config.headline,
			subheadline: source.config.subheadline,
			offerBadge: source.config.offerBadge,
			countdownMinutes: source.config.countdownMinutes,
			bulletPoints: source.config.bulletPoints,
			packages: source.config.packages,
			trustBox1Title: source.config.trustBox1Title,
			trustBox1Desc: source.config.trustBox1Desc,
			trustBox2Title: source.config.trustBox2Title,
			trustBox2Desc: source.config.trustBox2Desc,
			contactPhone: source.config.contactPhone,
			customPrice: source.config.customPrice,
			customOriginalPrice: source.config.customOriginalPrice,
			galleryImages: source.config.galleryImages
		});
	}
}
