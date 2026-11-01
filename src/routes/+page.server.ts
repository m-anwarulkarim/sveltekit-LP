import { publicProductColumns } from '#lib/server/services/product.service';
import { plainText } from '#lib/utils/html-safe';
import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { CustomizationService, CategoryService } from '#lib/server/services';

// Enough for every home section; the full catalog lives on /catalog/all-product.
const HOME_PRODUCT_LIMIT = 60;

export const load: PageServerLoad = async (event) => {
	let dbProducts: any[] = [];
	let dbCarousels: any[] = [];
	let dbCategories: any[] = [];
	let dbBanners: any[] = [];

	try {
		const db = getDb(event.platform);
		const rawProducts = await db
			.select(publicProductColumns)
			.from(schema.products)
			.where(eq(schema.products.status, 'published'))
			.orderBy(desc(schema.products.createdAt))
			.limit(HOME_PRODUCT_LIMIT)
			.all();

		dbProducts = rawProducts.map((p) => {
			const ratingNum = p.rating ? (p.rating > 5 ? p.rating / 10 : p.rating) : 0;
			const discountPercent =
				p.originalPrice > p.price
					? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
					: 0;

			return {
				id: p.id,
				name: p.name,
				slug: p.slug,
				tagline: p.tagline || '',
				category: p.category || 'beauty-health',
				categoryLabel: p.category || 'General',
				brand: p.model || '',
				price: p.price,
				originalPrice: p.originalPrice || p.price,
				rating: ratingNum,
				reviewsCount: p.reviewsCount || 0,
				discountPercent: discountPercent,
				deliveryTime: '12-24 HOURS',
				image: p.image || '/images/placeholder.svg',
				badge: p.badge || 'Published',
				badgeColor: 'bg-blue-600 text-white',
				features: [],
				description: plainText(p.description) || p.name,
				inStock: Boolean(p.inStock)
			};
		});

		try {
			dbCarousels = await CustomizationService.getActiveCarouselsForStorefront(db);
		} catch (carErr) {
			console.error('Failed to load active carousels for storefront:', carErr);
		}

		try {
			const liveCategories = await CategoryService.listCategories(db, { parentId: null, status: 'publish' });
			dbCategories = liveCategories || [];
		} catch (catErr) {
			console.error('Failed to load categories for storefront:', catErr);
		}

		try {
			dbBanners = await CustomizationService.getActiveBannersForStorefront(db);
		} catch (banErr) {
			console.error('Failed to load banners for storefront:', banErr);
		}
	} catch (e) {
		console.error('Failed to load storefront products from D1:', e);
	}

	return {
		user: event.locals.user ?? null,
		dbProducts,
		dbCarousels,
		dbCategories,
		dbBanners
	};
};
