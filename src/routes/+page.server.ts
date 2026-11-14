import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { CustomizationService, CategoryService } from '#lib/server/services';
import { cached } from '#lib/server/cache';

const HOME_PRODUCT_LIMIT = 30;

const homeProductColumns = {
	id: schema.products.id,
	name: schema.products.name,
	slug: schema.products.slug,
	category: schema.products.category,
	price: schema.products.price,
	originalPrice: schema.products.originalPrice,
	image: schema.products.image,
	badge: schema.products.badge,
	rating: schema.products.rating,
	reviewsCount: schema.products.reviewsCount,
	inStock: schema.products.inStock,
	totalStock: schema.products.totalStock,
	isPreOrder: schema.products.isPreOrder,
	model: schema.products.model,
} as const;

function mapProduct(p: typeof homeProductColumns extends Record<string, any> ? any : never) {
	const ratingNum = p.rating ? (p.rating > 5 ? p.rating / 10 : p.rating) : 0;
	const discountPercent =
		p.originalPrice > p.price
			? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
			: 0;
	return {
		id: p.id,
		name: p.name,
		slug: p.slug,
		category: p.category || '',
		categoryLabel: p.category || '',
		brand: p.model || '',
		price: p.price,
		originalPrice: p.originalPrice || p.price,
		rating: ratingNum,
		reviewsCount: p.reviewsCount || 0,
		discountPercent,
		image: p.image || '/images/placeholder.svg',
		badge: p.badge || '',
		badgeColor: 'bg-blue-600 text-white',
		features: [] as string[],
		inStock: Boolean(p.inStock),
		totalStock: p.totalStock !== undefined && p.totalStock !== null ? Number(p.totalStock) : 0,
		isPreOrder: Boolean(p.isPreOrder)
	};
}

export const load: PageServerLoad = async (event) => {
	let dbProducts: ReturnType<typeof mapProduct>[] = [];
	let dbCarousels: any[] = [];
	let dbCategories: any[] = [];
	let dbBanners: any[] = [];

	try {
		const db = getDb(event.platform);

		const [rawProducts, carousels, categories, banners] = await cached(
			'home-page',
			30_000,
			() => Promise.all([
				db
					.select(homeProductColumns)
					.from(schema.products)
					.where(eq(schema.products.status, 'published'))
					.orderBy(desc(schema.products.createdAt))
					.limit(HOME_PRODUCT_LIMIT)
					.all(),
				CustomizationService.getActiveCarouselsForStorefront(db).catch(() => [] as any[]),
				CategoryService.listCategories(db, { parentId: null, status: 'publish' }).catch(() => [] as any[]),
				CustomizationService.getActiveBannersForStorefront(db).catch(() => [] as any[])
			])
		);

		dbProducts = rawProducts.map(mapProduct);
		dbCarousels = carousels;
		dbCategories = categories || [];
		dbBanners = banners;
	} catch (e) {
		console.error('Failed to load storefront home data:', e);
	}

	return {
		dbProducts,
		dbCarousels,
		dbCategories,
		dbBanners
	};
};
