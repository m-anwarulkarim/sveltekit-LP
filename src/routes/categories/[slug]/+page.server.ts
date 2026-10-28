import type { PageServerLoad } from './$types';
import { getCategoryBySlug } from '#lib/modules/products/categories.data';
import type { Product } from '#lib/modules/products/types';
import { getDb } from '#lib/server/db/index';
import { CategoryService } from '#lib/server/services/category.service';
import * as schema from '#lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const slug = event.params.slug;
	let category: any = null;
	let allProducts: Product[] = [];

	try {
		const db = getDb(event.platform);
		const dbCat = await CategoryService.getCategory(db, slug);
		if (dbCat) {
			category = {
				id: dbCat.id,
				slug: dbCat.slug,
				name: dbCat.name,
				banglaName: dbCat.name,
				icon: dbCat.icon || '📦',
				description: dbCat.description || `${dbCat.name} কালেকশন`,
				subcategories: []
			};
		}

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

	if (!category) {
		category = getCategoryBySlug(slug) || {
			id: slug,
			slug,
			name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
			banglaName: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
			icon: '📦',
			description: 'কালেকশন ব্রাউজ করুন',
			subcategories: []
		};
	}

	// Filter products belonging to this category
	const categoryProducts = allProducts.filter((p) => {
		const cat = p.category.toLowerCase().trim();
		const targetSlug = slug.toLowerCase().trim();
		const targetName = category.name.toLowerCase().trim();
		if (cat === targetSlug || cat === targetName) return true;
		if (targetSlug === 'electronics' && (cat === 'headphones' || cat === 'in-ears' || cat === 'smart-gadgets')) return true;
		if (targetSlug === 'beauty-health' && (cat === 'skincare' || cat === 'beauty')) return true;
		if (targetSlug === 'smart-gadgets' && cat === 'electronics') return true;
		return false;
	});

	return {
		category,
		products: categoryProducts,
		allStoreProducts: allProducts,
		user: event.locals.user ?? null
	};
};
