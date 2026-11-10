import type { PageServerLoad } from './$types';
import type { Product } from '#lib/modules/products/types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { cached } from '#lib/server/cache';

const catalogColumns = {
	id: schema.products.id,
	name: schema.products.name,
	slug: schema.products.slug,
	tagline: schema.products.tagline,
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

export const load: PageServerLoad = async (event) => {
	const filterParam = event.url.searchParams.get('filter') || 'all';

	let allProducts: Product[] = [];

	try {
		const db = getDb(event.platform);
		const rawProducts = await cached('catalog-products', 30_000, () =>
			db
				.select(catalogColumns)
				.from(schema.products)
				.where(eq(schema.products.status, 'published'))
				.orderBy(desc(schema.products.createdAt))
				.all()
		);

		allProducts = rawProducts.map((p) => {
			const ratingNum = p.rating ? (p.rating > 5 ? p.rating / 10 : p.rating) : 0;
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
				reviewsCount: p.reviewsCount || 0,
				discountPercent,
				image: p.image || '/images/placeholder.svg',
				badge: p.badge || 'Published',
				badgeColor: 'bg-blue-600 text-white',
				features: [],
				inStock: Boolean(p.inStock),
				totalStock: p.totalStock !== undefined && p.totalStock !== null ? Number(p.totalStock) : 0,
				isPreOrder: Boolean(p.isPreOrder)
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
