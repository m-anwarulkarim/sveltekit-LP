import type { PageServerLoad } from './$types';
import type { Product } from '#lib/modules/products/types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const filterParam = event.url.searchParams.get('filter') || 'all';

	let allProducts: Product[] = [];

	try {
		const db = getDb(event.platform);
		const rawProducts = await db
			.select()
			.from(schema.products)
			.where(eq(schema.products.status, 'published'))
			.orderBy(desc(schema.products.createdAt))
			.all();

		allProducts = rawProducts.map((p) => {
			const ratingNum = p.rating ? (p.rating > 5 ? p.rating / 10 : p.rating) : 5;
			const discountPercent =
				p.originalPrice > p.price
					? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
					: 0;

			return {
				id: p.id,
				name: p.name,
				slug: p.slug || p.id,
				tagline: p.tagline || '',
				category: p.category || 'beauty-health',
				categoryLabel: p.category || 'General',
				brand: p.model || '',
				price: p.price,
				originalPrice: p.originalPrice || p.price,
				rating: ratingNum,
				reviewsCount: p.reviewsCount || 100,
				discountPercent,
				deliveryTime: '12-24 HOURS',
				image: p.image || '/images/placeholder.svg',
				badge: p.badge || 'Published',
				badgeColor: 'bg-blue-600 text-white',
				features: [],
				description: p.description || p.name,
				inStock: Boolean(p.inStock)
			};
		});
	} catch (e) {
		console.error('Failed to load products from D1:', e);
	}

	return {
		user: event.locals.user ?? null,
		allProducts,
		initialFilter: filterParam
	};
};
