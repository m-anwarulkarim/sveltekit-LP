import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import type { Product } from '#lib/modules/products/types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { SeoService } from '#lib/server/services/seo.service';
import { ReviewService } from '#lib/server/services/review.service';
import { eq, desc, ne } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { slug } = event.params;

	// Edge Caching: Fast delivery with SWR (Stale While Revalidate)
	event.setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'
	});

	let product: Product | null = null;
	let relatedProducts: Product[] = [];
	let productReviews: any[] = [];

	try {
		const db = getDb(event.platform);

		// Find targeted product by slug or id
		const rawProduct = await db
			.select()
			.from(schema.products)
			.where(eq(schema.products.slug, slug))
			.get();

		if (rawProduct) {
			// Fetch specs for features
			const specs = await db
				.select()
				.from(schema.productSpecs)
				.where(eq(schema.productSpecs.productId, rawProduct.id))
				.orderBy(schema.productSpecs.sortOrder)
				.all();

			// Fetch real reviews from D1 database
			productReviews = await ReviewService.listProductReviews(db, rawProduct.id);

			const ratingNum = rawProduct.rating ? (rawProduct.rating > 5 ? rawProduct.rating / 10 : rawProduct.rating) : 5;
			const discountPercent =
				rawProduct.originalPrice > rawProduct.price
					? Math.round(((rawProduct.originalPrice - rawProduct.price) / rawProduct.originalPrice) * 100)
					: 0;

			product = {
				id: rawProduct.id,
				name: rawProduct.name,
				slug: rawProduct.slug || rawProduct.id,
				tagline: rawProduct.tagline || '',
				category: rawProduct.category || 'beauty-health',
				categoryLabel: rawProduct.category || 'General',
				brand: rawProduct.model || '',
				price: rawProduct.price,
				originalPrice: rawProduct.originalPrice || rawProduct.price,
				rating: ratingNum,
				reviewsCount: productReviews.length > 0 ? productReviews.length : (rawProduct.reviewsCount || 0),
				discountPercent,
				deliveryTime: '12-24 HOURS',
				image: rawProduct.image || '/images/placeholder.svg',
				badge: rawProduct.badge || 'Published',
				badgeColor: 'bg-blue-600 text-white',
				features: specs.length > 0 ? specs.map((s) => s.value) : (rawProduct.description ? [rawProduct.description] : []),
				description: rawProduct.description || rawProduct.name,
				inStock: Boolean(rawProduct.inStock)
			};

			// Query related products from same category or published products
			const rawRelated = await db
				.select()
				.from(schema.products)
				.where(ne(schema.products.id, rawProduct.id))
				.limit(6)
				.all();

			relatedProducts = rawRelated.map((p) => {
				const rNum = p.rating ? (p.rating > 5 ? p.rating / 10 : p.rating) : 5;
				const dPercent = p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
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
					rating: rNum,
					reviewsCount: p.reviewsCount || 100,
					discountPercent: dPercent,
					deliveryTime: '12-24 HOURS',
					image: p.image || '/images/placeholder.svg',
					badge: p.badge || 'Published',
					badgeColor: 'bg-blue-600 text-white',
					features: [],
					description: p.description || p.name,
					inStock: Boolean(p.inStock)
				};
			});
		}
	} catch (e) {
		console.error('Failed to query DB for product details:', e);
	}

	if (!product) {
		throw error(404, 'প্রোডাক্টটি খুঁজে পাওয়া যায়নি');
	}

	const productJsonLd = SeoService.getProductJsonLd({
		name: product.name,
		description:
			product.description ||
			product.tagline ||
			`${product.name} - কিনুন আসল কোয়ালিটির পণ্য সবচেয়ে কম মূল্যে AURA স্টোরে।`,
		slug: product.slug,
		price: product.price,
		regularPrice: product.originalPrice,
		image: product.image,
		sku: product.id,
		ratingValue: product.rating,
		reviewCount: product.reviewsCount,
		inStock: product.inStock
	});

	const breadcrumbsJsonLd = SeoService.getBreadcrumbsJsonLd([
		{ name: 'হোম', url: '/' },
		{ name: product.categoryLabel || 'ক্যাটালগ', url: `/categories/${product.category}` },
		{ name: product.name, url: `/products/${product.slug}` }
	]);

	return {
		product,
		reviews: productReviews,
		relatedProducts,
		productJsonLd,
		breadcrumbsJsonLd
	};
};

export const actions: Actions = {
	addReview: async ({ request, platform }) => {
		try {
			const data = await request.formData();
			const productId = data.get('productId')?.toString();
			const author = data.get('author')?.toString()?.trim();
			const rating = parseInt(data.get('rating')?.toString() || '5');
			const title = data.get('title')?.toString()?.trim();
			const content = data.get('content')?.toString()?.trim();

			if (!productId || !author || !content) {
				return fail(400, { message: 'সবগুলো আবশ্যক তথ্য পূরণ করুন।' });
			}

			const db = getDb(platform);
			await ReviewService.addReview(db, {
				productId,
				author,
				rating,
				title,
				content,
				role: 'ভেরিফাইড ক্রেতা'
			});

			return { success: true, message: 'আপনার রিভিউটি সফলভাবে গৃহীত হয়েছে!' };
		} catch (err: any) {
			console.error('Add review error:', err);
			return fail(500, { message: err?.message || 'রিভিউ যুক্ত করতে সমস্যা হয়েছে।' });
		}
	}
};
