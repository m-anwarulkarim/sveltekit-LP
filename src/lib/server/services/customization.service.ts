import { eq, desc, asc, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { MediaService } from './media.service';

export interface CarouselInput {
	name: string;
	image: string;
	mobileImage?: string;
	targetUrl: string;
	urlType?: string;
	description?: string;
	sortOrder?: number;
	status?: string;
}

export interface BannerInput {
	title: string;
	image: string;
	targetUrl: string;
	urlType?: string;
	placement?: string;
	displayOptions?: string;
	sortOrder?: number;
	status?: string;
}

export interface PopupInput {
	title: string;
	triggerType?: 'on_load' | 'exit_intent' | 'delay_seconds';
	delaySeconds?: number;
	imageUrl?: string;
	targetUrl?: string;
	status?: string;
}

export class CustomizationService {
	// ================= CAROUSELS ================= //

	static async listCarousels(db: DrizzleD1Database<typeof schema>) {
		const countRes = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.carousels)
			.all();
		const total = countRes[0]?.count ?? 0;

		if (total === 0) {
			await this.seedInitialCarousels(db);
		}

		return await db
			.select()
			.from(schema.carousels)
			.orderBy(asc(schema.carousels.sortOrder), desc(schema.carousels.createdAt))
			.all();
	}

	static async getCarouselById(db: DrizzleD1Database<typeof schema>, id: string) {
		const rows = await db
			.select()
			.from(schema.carousels)
			.where(eq(schema.carousels.id, id))
			.limit(1)
			.all();
		return rows[0] || null;
	}

	static async createCarousel(db: DrizzleD1Database<typeof schema>, input: CarouselInput) {
		const id = crypto.randomUUID();
		const newRecord = {
			id,
			name: input.name,
			image: input.image || '/images/banners/banner-home.svg',
			mobileImage: input.mobileImage || null,
			targetUrl: input.targetUrl || '/Home',
			urlType: input.urlType || 'Internal',
			description: input.description || '',
			sortOrder: Number(input.sortOrder) || 1,
			status: input.status || 'Publish'
		};

		await db.insert(schema.carousels).values(newRecord as any);
		return newRecord;
	}

	static async updateCarousel(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		input: Partial<CarouselInput>
	) {
		const updateData: any = {};
		if (input.name !== undefined) updateData.name = input.name;
		if (input.image !== undefined) updateData.image = input.image;
		if (input.mobileImage !== undefined) updateData.mobileImage = input.mobileImage;
		if (input.targetUrl !== undefined) updateData.targetUrl = input.targetUrl;
		if (input.urlType !== undefined) updateData.urlType = input.urlType;
		if (input.description !== undefined) updateData.description = input.description;
		if (input.sortOrder !== undefined) updateData.sortOrder = Number(input.sortOrder) || 1;
		if (input.status !== undefined) updateData.status = input.status;

		await db.update(schema.carousels).set(updateData).where(eq(schema.carousels.id, id));
		return await this.getCarouselById(db, id);
	}

	static async deleteCarousel(db: DrizzleD1Database<typeof schema>, id: string, platform?: any) {
		try {
			const orig = await this.getCarouselById(db, id);
			if (orig?.image && (orig.image.startsWith('/api/r2-local/') || orig.image.startsWith('/uploads/'))) {
				await MediaService.deleteMediaByUrl(db, orig.image, platform);
			}
			if (orig?.mobileImage && (orig.mobileImage.startsWith('/api/r2-local/') || orig.mobileImage.startsWith('/uploads/'))) {
				await MediaService.deleteMediaByUrl(db, orig.mobileImage, platform);
			}
		} catch (e) {
			console.error(`Failed to clean up carousel media for ${id}:`, e);
		}
		await db.delete(schema.carousels).where(eq(schema.carousels.id, id));
		return { success: true };
	}

	static async duplicateCarousel(db: DrizzleD1Database<typeof schema>, id: string) {
		const orig = await this.getCarouselById(db, id);
		if (!orig) throw new Error('Carousel not found');

		const newId = crypto.randomUUID();
		const clone = {
			id: newId,
			name: `${orig.name} (Copy)`,
			image: orig.image,
			mobileImage: orig.mobileImage,
			targetUrl: orig.targetUrl,
			urlType: orig.urlType || 'Internal',
			description: orig.description || '',
			sortOrder: (orig.sortOrder || 1) + 1,
			status: 'Draft',
			startDate: orig.startDate,
			endDate: orig.endDate,
			viewCount: 0,
			clickCount: 0
		};

		await db.insert(schema.carousels).values(clone as any);
		return clone;
	}

	static async reorderCarousels(db: DrizzleD1Database<typeof schema>, orderedIds: string[]) {
		for (let i = 0; i < orderedIds.length; i++) {
			await db
				.update(schema.carousels)
				.set({ sortOrder: i + 1 })
				.where(eq(schema.carousels.id, orderedIds[i]));
		}
		return { success: true };
	}

	static async incrementImpression(db: DrizzleD1Database<typeof schema>, id: string) {
		await db
			.update(schema.carousels)
			.set({ viewCount: sql`${schema.carousels.viewCount} + 1` })
			.where(eq(schema.carousels.id, id));
	}

	static async incrementClick(db: DrizzleD1Database<typeof schema>, id: string) {
		await db
			.update(schema.carousels)
			.set({ clickCount: sql`${schema.carousels.clickCount} + 1` })
			.where(eq(schema.carousels.id, id));
	}

	static async getActiveCarouselsForStorefront(db: DrizzleD1Database<typeof schema>) {
		const now = Date.now();
		const rows = await db
			.select()
			.from(schema.carousels)
			.where(eq(schema.carousels.status, 'Publish'))
			.orderBy(asc(schema.carousels.sortOrder), desc(schema.carousels.createdAt))
			.all();

		// Filter active by campaign date windows if scheduled
		return rows.filter((r) => {
			if (r.startDate && new Date(r.startDate).getTime() > now) return false;
			if (r.endDate && new Date(r.endDate).getTime() < now) return false;
			return true;
		});
	}

	private static async seedInitialCarousels(db: DrizzleD1Database<typeof schema>) {
		const defaults = [
			{
				id: 'car-seed-1',
				name: 'উন্নত জাতের সবজি ও ফল বীজ',
				image: '/images/hero/vegetable-seeds-hero.webp',
				targetUrl: '/catalog/all-product',
				urlType: 'Internal',
				description: 'শতভাগ অঙ্কুরোদগম ক্ষমতাসম্পন্ন দেশি ও হাইব্রিড বীজ সংগ্রহ',
				sortOrder: 1,
				status: 'Publish'
			},
			{
				id: 'car-seed-2',
				name: 'ছাদবাগান ও কিচেন গার্ডেনিং স্পেশাল',
				image: '/images/hero/rooftop-gardening-hero.webp',
				targetUrl: '/catalog/all-product?tag=rooftop-garden',
				urlType: 'Internal',
				description: 'শহুরে ছাদবাগান ও বারান্দার জন্য উপযুক্ত জাত ও পরামর্শ',
				sortOrder: 2,
				status: 'Publish'
			},
			{
				id: 'car-seed-3',
				name: 'আধুনিক কৃষি সরঞ্জাম ও সুরক্ষা',
				image: '/images/hero/garden-tools-hero.webp',
				targetUrl: '/catalog/all-product?category=krishi-tools',
				urlType: 'Internal',
				description: 'বাগান পরিচর্যা ও ফসল সুরক্ষায় সেরা কৃষি যন্ত্রপাতি',
				sortOrder: 3,
				status: 'Publish'
			}
		];

		for (const d of defaults) {
			await db.insert(schema.carousels).values(d as any);
		}
	}

	// ================= BANNERS ================= //

	static async listBanners(db: DrizzleD1Database<typeof schema>) {
		const countRes = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.banners)
			.all();
		const total = countRes[0]?.count ?? 0;

		if (total === 0) {
			await this.seedInitialBanners(db);
		}

		return await db
			.select()
			.from(schema.banners)
			.orderBy(asc(schema.banners.sortOrder), desc(schema.banners.createdAt))
			.all();
	}

	static async getBannerById(db: DrizzleD1Database<typeof schema>, id: string) {
		const rows = await db
			.select()
			.from(schema.banners)
			.where(eq(schema.banners.id, id))
			.limit(1)
			.all();
		return rows[0] || null;
	}

	static async createBanner(db: DrizzleD1Database<typeof schema>, input: BannerInput) {
		const id = crypto.randomUUID();
		const newRecord = {
			id,
			title: input.title,
			image: input.image || '/images/banners/banner-home.svg',
			targetUrl: input.targetUrl || '/home',
			urlType: input.urlType || 'Internal',
			placement: input.placement || 'Home Page Top Banner',
			displayOptions: input.displayOptions || 'Show on Home',
			sortOrder: Number(input.sortOrder) || 10,
			status: input.status || 'Publish'
		};

		await db.insert(schema.banners).values(newRecord as any);
		return newRecord;
	}

	static async updateBanner(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		input: Partial<BannerInput>
	) {
		const updateData: any = {};
		if (input.title !== undefined) updateData.title = input.title;
		if (input.image !== undefined) updateData.image = input.image;
		if (input.targetUrl !== undefined) updateData.targetUrl = input.targetUrl;
		if (input.urlType !== undefined) updateData.urlType = input.urlType;
		if (input.placement !== undefined) updateData.placement = input.placement;
		if (input.displayOptions !== undefined) updateData.displayOptions = input.displayOptions;
		if (input.sortOrder !== undefined) updateData.sortOrder = Number(input.sortOrder) || 10;
		if (input.status !== undefined) updateData.status = input.status;

		await db.update(schema.banners).set(updateData).where(eq(schema.banners.id, id));
		return await this.getBannerById(db, id);
	}

	static async deleteBanner(db: DrizzleD1Database<typeof schema>, id: string, platform?: any) {
		try {
			const orig = await this.getBannerById(db, id);
			if (orig?.image && (orig.image.startsWith('/api/r2-local/') || orig.image.startsWith('/uploads/'))) {
				await MediaService.deleteMediaByUrl(db, orig.image, platform);
			}
		} catch (e) {
			console.error(`Failed to clean up banner media for ${id}:`, e);
		}
		await db.delete(schema.banners).where(eq(schema.banners.id, id));
		return { success: true };
	}

	static async getActiveBannersForStorefront(
		db: DrizzleD1Database<typeof schema>,
		placement?: string
	) {
		if (placement) {
			return await db
				.select()
				.from(schema.banners)
				.where(
					sql`${schema.banners.status} = 'Publish' AND ${schema.banners.placement} = ${placement}`
				)
				.orderBy(asc(schema.banners.sortOrder), desc(schema.banners.createdAt))
				.all();
		}

		return await db
			.select()
			.from(schema.banners)
			.where(eq(schema.banners.status, 'Publish'))
			.orderBy(asc(schema.banners.sortOrder), desc(schema.banners.createdAt))
			.all();
	}

	private static async seedInitialBanners(db: DrizzleD1Database<typeof schema>) {
		const defaults = [
			{
				id: 'ban-1',
				title: 'bannar1',
				image: '/images/banners/banner-home.svg',
				targetUrl: '/catalog/all-product',
				urlType: 'Internal',
				placement: 'Home Page Top Banner',
				displayOptions: 'Show on Home',
				sortOrder: 10,
				status: 'Publish'
			},
			{
				id: 'ban-2',
				title: 'bannar2',
				image: '/images/banners/banner-combo.svg',
				targetUrl: '/catalog/all-product?filter=best-sale',
				urlType: 'Internal',
				placement: 'Category Middle Banner',
				displayOptions: 'Show on Home',
				sortOrder: 20,
				status: 'Publish'
			}
		];

		for (const d of defaults) {
			await db.insert(schema.banners).values(d as any);
		}
	}

	// ================= POPUPS ================= //

	static async listPopups(db: DrizzleD1Database<typeof schema>) {
		const countRes = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.popups)
			.all();
		const total = countRes[0]?.count ?? 0;

		if (total === 0) {
			await this.seedInitialPopups(db);
		}

		return await db
			.select()
			.from(schema.popups)
			.orderBy(desc(schema.popups.createdAt))
			.all();
	}

	static async getPopupById(db: DrizzleD1Database<typeof schema>, id: string) {
		const rows = await db
			.select()
			.from(schema.popups)
			.where(eq(schema.popups.id, id))
			.limit(1)
			.all();
		return rows[0] || null;
	}

	static async createPopup(db: DrizzleD1Database<typeof schema>, input: PopupInput) {
		const id = crypto.randomUUID();
		const normalizedStatus =
			input.status === 'DRAFT' || input.status === 'inactive' ? 'inactive' : 'active';
		const newRecord = {
			id,
			title: input.title,
			triggerType: input.triggerType || 'on_load',
			delaySeconds: Number(input.delaySeconds) || 5,
			imageUrl: input.imageUrl || '/images/banners/banner-combo.svg',
			targetUrl: input.targetUrl || '/catalog/all-product',
			status: normalizedStatus
		};

		await db.insert(schema.popups).values(newRecord as any);
		return newRecord;
	}

	static async updatePopup(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		input: Partial<PopupInput>
	) {
		const updateData: any = {};
		if (input.title !== undefined) updateData.title = input.title;
		if (input.triggerType !== undefined) updateData.triggerType = input.triggerType;
		if (input.delaySeconds !== undefined) updateData.delaySeconds = Number(input.delaySeconds) || 5;
		if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
		if (input.targetUrl !== undefined) updateData.targetUrl = input.targetUrl;
		if (input.status !== undefined) {
			updateData.status =
				input.status === 'DRAFT' || input.status === 'inactive' ? 'inactive' : 'active';
		}

		await db.update(schema.popups).set(updateData).where(eq(schema.popups.id, id));
		return await this.getPopupById(db, id);
	}

	static async deletePopup(db: DrizzleD1Database<typeof schema>, id: string, platform?: any) {
		try {
			const orig = await this.getPopupById(db, id);
			if (orig?.imageUrl && (orig.imageUrl.startsWith('/api/r2-local/') || orig.imageUrl.startsWith('/uploads/'))) {
				await MediaService.deleteMediaByUrl(db, orig.imageUrl, platform);
			}
		} catch (e) {
			console.error(`Failed to clean up popup media for ${id}:`, e);
		}
		await db.delete(schema.popups).where(eq(schema.popups.id, id));
		return { success: true };
	}

	static async getActivePopupForStorefront(db: DrizzleD1Database<typeof schema>) {
		const rows = await db
			.select()
			.from(schema.popups)
			.where(sql`${schema.popups.status} = 'active' OR ${schema.popups.status} = 'PUBLISH'`)
			.orderBy(desc(schema.popups.createdAt))
			.limit(1)
			.all();

		return rows[0] || null;
	}

	private static async seedInitialPopups(db: DrizzleD1Database<typeof schema>) {
		const defaultPopup = {
			id: 'pop-1',
			title: 'স্পেশাল ডিসকাউন্ট অফার! ১০% ছাড় উপভোগ করুন',
			triggerType: 'delay_seconds',
			delaySeconds: 4,
			imageUrl: '/images/banners/banner-combo.svg',
			targetUrl: '/catalog/all-product',
			status: 'active'
		};

		await db.insert(schema.popups).values(defaultPopup as any);
	}
}

