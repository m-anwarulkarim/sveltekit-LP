import { eq, desc, asc, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

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

	static async deleteCarousel(db: DrizzleD1Database<typeof schema>, id: string) {
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
				id: 'car-1',
				name: 'Banner',
				image: '/images/banners/banner-home.svg',
				targetUrl: '/Home',
				urlType: 'Internal',
				description: 'Special hero banner for homepage showcase',
				sortOrder: 1,
				status: 'Publish'
			},
			{
				id: 'car-2',
				name: 'Citizens',
				image: '/images/banners/banner-citizens.svg',
				targetUrl: 'https://www.citizens.com.bd/',
				urlType: 'External',
				description: 'Citizens partner promotional banner',
				sortOrder: 2,
				status: 'Publish'
			},
			{
				id: 'car-3',
				name: 'Combo Offer',
				image: '/images/banners/banner-combo.svg',
				targetUrl: '/Products',
				urlType: 'Internal',
				description: 'Exclusive bundle discount on beauty products',
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

	static async deleteBanner(db: DrizzleD1Database<typeof schema>, id: string) {
		await db.delete(schema.banners).where(eq(schema.banners.id, id));
		return { success: true };
	}

	private static async seedInitialBanners(db: DrizzleD1Database<typeof schema>) {
		const defaults = [
			{
				id: 'ban-1',
				title: 'bannar1',
				image: '/images/banners/banner-home.svg',
				targetUrl: '/home',
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
				targetUrl: '/category/beauty',
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
}

