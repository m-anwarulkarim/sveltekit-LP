import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { CustomizationService, CategoryService } from '#lib/server/services';

export const load: PageServerLoad = async (event) => {
	let dbProducts: any[] = [];
	let dbCarousels: any[] = [];
	let dbCategories: any[] = [];

	try {
		const db = getDb(event.platform);
		const rawProducts = await db
			.select()
			.from(schema.products)
			.where(eq(schema.products.status, 'published'))
			.orderBy(desc(schema.products.createdAt))
			.all();

		dbProducts = rawProducts.map((p) => {
			const ratingNum = p.rating ? (p.rating > 5 ? p.rating / 10 : p.rating) : 5;
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
				reviewsCount: p.reviewsCount || 100,
				discountPercent: discountPercent,
				deliveryTime: '12-24 HOURS',
				image: p.image || '/images/placeholder.svg',
				badge: p.badge || 'Published',
				badgeColor: 'bg-blue-600 text-white',
				features: [],
				description: p.description || p.name,
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
	} catch (e) {
		console.error('Failed to load storefront products from D1:', e);
	}

	return {
		user: event.locals.user ?? null,
		dbProducts,
		dbCarousels,
		dbCategories
	};
};
