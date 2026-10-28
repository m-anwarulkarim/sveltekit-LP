import type { PageServerLoad } from './$types';
import { getCategoryBySlug } from '#lib/modules/products/categories.data';
import type { Product } from '#lib/modules/products/types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const slug = event.params.slug;
	const category = getCategoryBySlug(slug);

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
				category: p.category || 'general',
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
		console.error('Failed to load DB products in category page:', e);
	}

	// Filter products belonging to this category
	const categoryProducts = allProducts.filter((p) => {
		const cat = p.category.toLowerCase();
		const target = slug.toLowerCase();
		if (cat === target) return true;
		if (target === 'electronics' && (cat === 'headphones' || cat === 'in-ears' || cat === 'smart-gadgets')) return true;
		if (target === 'beauty-health' && (cat === 'skincare' || cat === 'beauty')) return true;
		if (target === 'smart-gadgets' && cat === 'electronics') return true;
		return false;
	});

	return {
		category,
		products: categoryProducts,
		allStoreProducts: allProducts,
		user: event.locals.user ?? null
	};
};
