import { eq, desc, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface LandingPageContent {
	headline?: string;
	subheadline?: string;
	offerBadge?: string;
	countdownMinutes?: number;
	bulletPoints?: string[];
	features?: Array<{ title: string; desc: string; icon?: string }>;
	customPrice?: number;
	customOriginalPrice?: number;
	guaranteeText?: string;
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
	features?: Array<{ title: string; desc: string }>;
	customPrice?: number;
	customOriginalPrice?: number;
	galleryImages?: string[];
}

export class LandingPageService {
	/**
	 * Lists all landing pages with their associated product details
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

		// If no landing pages exist yet, seed initial high-converting demo pages
		if (rows.length === 0) {
			await this.seedDemoPages(db);
			return await this.listLandingPages(db);
		}

		return rows.map(({ landing, product }) => {
			let config: LandingPageContent = {};
			try {
				if (landing.metaDescription?.startsWith('{')) {
					config = JSON.parse(landing.metaDescription);
				} else {
					config = {
						headline: landing.title,
						subheadline: landing.metaDescription || '',
						offerBadge: landing.tag || 'স্পেশাল অফার'
					};
				}
			} catch {
				config = { headline: landing.title, subheadline: landing.metaDescription || '' };
			}

			// Format products images
			let productImages: string[] = [];
			if (product?.images) {
				try {
					productImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
				} catch {
					productImages = ['/images/placeholder.svg'];
				}
			}

			return {
				...landing,
				product: product ? { ...product, parsedImages: productImages } : null,
				config,
				url: `/lp/${landing.slug}`
			};
		});
	}

	/**
	 * Retrieves a landing page by slug and increments views
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

		const { landing, product } = row;

		// Increment view count in background
		try {
			await db
				.update(schema.landingPages)
				.set({ views: (landing.views || 0) + 1 })
				.where(eq(schema.landingPages.id, landing.id));
		} catch (e) {
			console.error('Failed to update landing page views:', e);
		}

		let config: LandingPageContent = {};
		try {
			if (landing.metaDescription?.startsWith('{')) {
				config = JSON.parse(landing.metaDescription);
			} else {
				config = {
					headline: landing.title,
					subheadline: landing.metaDescription || '',
					offerBadge: landing.tag || 'স্পেশাল অফার'
				};
			}
		} catch {
			config = { headline: landing.title, subheadline: landing.metaDescription || '' };
		}

		let productImages: string[] = [];
		if (product?.images) {
			try {
				productImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
			} catch {
				productImages = ['/images/placeholder.svg'];
			}
		}

		return {
			...landing,
			product: product ? { ...product, parsedImages: productImages } : null,
			config,
			url: `/lp/${landing.slug}`
		};
	}

	/**
	 * Creates a new custom landing page
	 */
	static async createLandingPage(db: DrizzleD1Database<typeof schema>, input: CreateLandingInput) {
		const configData: LandingPageContent = {
			headline: input.headline || input.title,
			subheadline: input.subheadline || '',
			offerBadge: input.offerBadge || input.tag || 'সীমিত সময়ের অফার',
			countdownMinutes: input.countdownMinutes || 45,
			bulletPoints: input.bulletPoints || [
				'১০০% প্রিমিয়াম কোয়ালিটি গ্যারান্টি',
				'সরাসরি ক্যাশ অন ডেলিভারি সুবিধা',
				'পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ',
				'সারাদেশে দ্রুততম হোম ডেলিভারি'
			],
			features: input.features || [
				{ title: 'দ্রুত ডেলিভারি', desc: '২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি' },
				{ title: 'মানসম্মত পণ্য', desc: 'অরিজিনাল এবং প্রিমিয়াম উপাদান' },
				{ title: 'সহজ রিটার্ন', desc: 'কোনো সমস্যা হলে তাৎক্ষণিক সাপোর্ট' }
			],
			customPrice: input.customPrice,
			customOriginalPrice: input.customOriginalPrice,
			galleryImages: input.galleryImages || []
		};

		const cleanSlug = input.slug
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9-]/g, '-')
			.replace(/-+/g, '-');

		const id = crypto.randomUUID();

		await db.insert(schema.landingPages).values({
			id,
			title: input.title,
			slug: cleanSlug,
			productId: input.productId || null,
			sku: input.sku || `LP-${Math.floor(1000 + Math.random() * 9000)}`,
			tag: input.tag || 'জনপ্রিয় পেজ',
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
	 * Retrieves a landing page by ID
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

		const { landing, product } = row;
		let config: LandingPageContent = {};
		try {
			if (landing.metaDescription?.startsWith('{')) {
				config = JSON.parse(landing.metaDescription);
			} else {
				config = {
					headline: landing.title,
					subheadline: landing.metaDescription || '',
					offerBadge: landing.tag || 'স্পেশাল অফার'
				};
			}
		} catch {
			config = { headline: landing.title, subheadline: landing.metaDescription || '' };
		}

		let productImages: string[] = [];
		if (product?.images) {
			try {
				productImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
			} catch {
				productImages = ['/images/placeholder.svg'];
			}
		}

		return {
			...landing,
			product: product ? { ...product, parsedImages: productImages } : null,
			config,
			url: `/lp/${landing.slug}`
		};
	}

	/**
	 * Updates an existing landing page
	 */
	static async updateLandingPage(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		input: Partial<CreateLandingInput>
	) {
		const existing = await this.getLandingPageById(db, id);
		if (!existing) throw new Error('ল্যান্ডিং পেজ পাওয়া যায়নি');

		const mergedConfig: LandingPageContent = {
			...existing.config,
			headline: input.headline !== undefined ? input.headline : existing.config.headline,
			subheadline: input.subheadline !== undefined ? input.subheadline : existing.config.subheadline,
			offerBadge: input.offerBadge !== undefined ? input.offerBadge : existing.config.offerBadge,
			countdownMinutes: input.countdownMinutes !== undefined ? input.countdownMinutes : existing.config.countdownMinutes,
			bulletPoints: input.bulletPoints !== undefined ? input.bulletPoints : existing.config.bulletPoints,
			customPrice: input.customPrice !== undefined ? input.customPrice : existing.config.customPrice,
			customOriginalPrice: input.customOriginalPrice !== undefined ? input.customOriginalPrice : existing.config.customOriginalPrice,
			galleryImages: input.galleryImages !== undefined ? input.galleryImages : (existing.config.galleryImages || [])
		};

		const cleanSlug = input.slug
			? input.slug
					.toLowerCase()
					.trim()
					.replace(/[^a-z0-9-]/g, '-')
					.replace(/-+/g, '-')
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
				metaDescription: JSON.stringify(mergedConfig)
			})
			.where(eq(schema.landingPages.id, id));

		return { id, slug: cleanSlug };
	}

	/**
	 * Deletes a landing page by ID
	 */
	static async deleteLandingPage(db: DrizzleD1Database<typeof schema>, id: string) {
		await db.delete(schema.landingPages).where(eq(schema.landingPages.id, id));
		return { success: true };
	}

	/**
	 * Seeds 3 rich high-conversion demo pages with realistic products
	 */
	private static async seedDemoPages(db: DrizzleD1Database<typeof schema>) {
		// Try to find first existing products in database
		let existingProducts: any[] = [];
		try {
			existingProducts = await db.select().from(schema.products).limit(3).all();
		} catch {}

		const demoPages = [
			{
				title: 'AURA Pro Studio Wireless Headphone - বিশেষ মেগা অফার',
				slug: 'wireless-headphone-special',
				sku: 'AUDIO-8801',
				productId: existingProducts[0]?.id || null,
				tag: 'মেগা অফার ⚡',
				category: 'Electronics',
				status: 'Published' as const,
				template: 'style_1_animated',
				headline: 'হাই-ফাই স্টুডিও সাউন্ড ও অ্যাক্টিভ নয়েজ ক্যান্সেলেশন',
				subheadline: '৪০ ঘণ্টার দীর্ঘ ব্যাটারি ব্যাকআপ এবং আল্ট্রা-কমফোর্ট কুশন সহ আজই অর্ডার করুন বিশেষ ছাড়ে!',
				offerBadge: '🔥 ৫০% মেগা ডিসকাউন্ট অফার',
				countdownMinutes: 30,
				customPrice: 1850,
				customOriginalPrice: 3500,
				bulletPoints: [
					'স্মার্ট অ্যাক্টিভ নয়েজ ক্যান্সেলেশন (ANC) প্রযুক্তি',
					'৪০ ঘণ্টা পর্যন্ত একটানা মিউজিক ও কলিং টাইম',
					'টাইপ-সি সুপার ফাস্ট চার্জিং সুবিধা',
					'সারাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি'
				]
			},
			{
				title: 'স্মার্ট হেলথ ট্র্যাকার ওয়াচ Series 9 - প্রিমিয়াম এডিশন',
				slug: 'smart-watch-series9',
				sku: 'WATCH-9902',
				productId: existingProducts[1]?.id || null,
				tag: 'বেস্ট সেলার 👑',
				category: 'Smart Gadget',
				status: 'Published' as const,
				template: 'style_1_animated',
				headline: 'আপনার ফিটনেস ও স্টাইলের পারফেক্ট সঙ্গী',
				subheadline: 'হার্ট রেট, ব্লুটুথ কলিং, স্লিপ ট্র্যাকার ও ওয়াটারপ্রুফ ডিজাইন নিয়ে এলো নতুন সিরিজ ৯!',
				offerBadge: '⚡ সীমিত সময়ের স্টক অফার',
				countdownMinutes: 45,
				customPrice: 1450,
				customOriginalPrice: 2800,
				bulletPoints: [
					'ফুল এইচডি ওলেড কার্ভড টাচস্ক্রিন ডিসপ্লে',
					'ব্লুটুথ সরাসরি এইচডি কলিং ও নোটিফিকেশন',
					'ওয়াটারপ্রুফ আইপি৬৮ স্ট্যান্ডার্ড সার্টিফিকেশন',
					'৭ দিনের দীর্ঘস্থায়ী ব্যাটারি লাইফ'
				]
			},
			{
				title: 'প্রিমিয়াম পুদিনা ও ঔষধি সিড কালেকশন প্যাক',
				slug: 'hybrid-herbal-seed-pack',
				sku: 'AGRO-1534',
				productId: existingProducts[2]?.id || null,
				tag: 'প্রাকৃতিক অর্গানিক 🌱',
				category: 'Gardening',
				status: 'Published' as const,
				template: 'style_1_animated',
				headline: 'ঘরেই সহজে চাষ করুন ফ্রেশ পুদিনা ও ঔষধি গাছ',
				subheadline: '৯৮% অঙ্কুরোদগম নিশ্চিত হাইব্রিড জাতের পুদিনা ও গ্রিন মিন্ট সিড কম্বো প্যাক।',
				offerBadge: '🎁 কিনলে সাথে ১টি সার প্যাক ফ্রি',
				countdownMinutes: 60,
				customPrice: 450,
				customOriginalPrice: 750,
				bulletPoints: [
					'১০০% অর্গানিক ও ৯৮% অঙ্কুরোদগম ক্ষমতা সম্পন্ন',
					'ছাদবাগান ও বারান্দার টবের জন্য অত্যন্ত উপযুক্ত',
					'সহজে পরিচর্যার জন্য বিনামূল্যে গাইড বুক',
					'পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানকে টাকা দিন'
				]
			}
		];

		for (const page of demoPages) {
			try {
				await this.createLandingPage(db, page);
			} catch (e) {
				console.error('Failed to insert demo page:', e);
			}
		}
	}
}

