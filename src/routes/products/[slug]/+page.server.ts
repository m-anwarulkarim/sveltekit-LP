import { publicProductColumns } from '#lib/server/services/product.service';
import { plainText } from '#lib/utils/html-safe';
import { sanitizeRichText } from '#lib/utils/sanitize-html';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import type { Product } from '#lib/modules/products/types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { SeoService } from '#lib/server/services/seo.service';
import { ReviewService } from '#lib/server/services/review.service';
import {
	OrderService,
	OrderPriceChangedError,
	OrderValidationError
} from '#lib/server/services/order.service';
import { PixelService } from '#lib/server/services/pixel.service';
import { SettingsService } from '#lib/server/services/settings.service';
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
			.select(publicProductColumns)
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

			const ratingNum = rawProduct.rating ? (rawProduct.rating > 5 ? rawProduct.rating / 10 : rawProduct.rating) : 0;
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
				features: specs.length > 0 ? specs.map((s) => s.value) : (rawProduct.description ? [plainText(rawProduct.description)] : []),
				description: sanitizeRichText(rawProduct.description) || rawProduct.name,
				inStock: Boolean(rawProduct.inStock),
				totalStock: rawProduct.totalStock !== undefined && rawProduct.totalStock !== null ? Number(rawProduct.totalStock) : 0,
				isPreOrder: Boolean(rawProduct.isPreOrder)
			};

			// Query related products from same category or published products
			const rawRelated = await db
				.select(publicProductColumns)
				.from(schema.products)
				.where(ne(schema.products.id, rawProduct.id))
				.limit(6)
				.all();

			relatedProducts = rawRelated.map((p) => {
				const rNum = p.rating ? (p.rating > 5 ? p.rating / 10 : p.rating) : 0;
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
					reviewsCount: p.reviewsCount || 0,
					discountPercent: dPercent,
					deliveryTime: '12-24 HOURS',
					image: p.image || '/images/placeholder.svg',
					badge: p.badge || 'Published',
					badgeColor: 'bg-blue-600 text-white',
					features: [],
					description: plainText(p.description) || p.name,
					inStock: Boolean(p.inStock),
					totalStock: p.totalStock !== undefined && p.totalStock !== null ? Number(p.totalStock) : 0,
					isPreOrder: Boolean(p.isPreOrder)
				};
			});
		}
	} catch (e) {
		console.error('Failed to query DB for product details:', e);
	}

	if (!product) {
		throw error(404, 'প্রোডাক্টটি খুঁজে পাওয়া যায়নি');
	}

	const realRating =
		productReviews.length > 0
			? productReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / productReviews.length
			: 0;

	const parentData = await event.parent();
	const siteName = parentData.websiteInfo?.websiteName || 'Store';
	const siteConfig = { siteName, siteUrl: event.url.origin };

	const productJsonLd = SeoService.getProductJsonLd({
		name: product.name,
		description:
			plainText(product.description, 300) ||
			product.tagline ||
			`${product.name} - কিনুন আসল কোয়ালিটির পণ্য সবচেয়ে কম মূল্যে ${siteName} স্টোরে।`,
		slug: product.slug,
		price: product.price,
		regularPrice: product.originalPrice,
		image: product.image,
		sku: product.id,
		ratingValue: realRating,
		reviewCount: productReviews.length,
		inStock: product.inStock
	}, siteConfig);

	const breadcrumbsJsonLd = SeoService.getBreadcrumbsJsonLd([
		{ name: 'হোম', url: '/' },
		{ name: product.categoryLabel || 'ক্যাটালগ', url: `/categories/${product.category}` },
		{ name: product.name, url: `/products/${product.slug}` }
	], siteConfig);

	let paymentConfig = {
		enableCOD: true,
		enableBkash: false,
		enableNagad: false
	};

	try {
		const db = getDb(event.platform);
		const pCfg = await SettingsService.getPaymentConfig(db);
		if (pCfg) {
			paymentConfig = {
				enableCOD: pCfg.enableCOD,
				enableBkash: pCfg.enableBkash,
				enableNagad: pCfg.enableNagad
			};
		}
	} catch (e) {
		console.error('Failed to load payment config:', e);
	}

	return {
		user: event.locals.user ?? null,
		isLoginRequired: parentData.themeConfig?.pageViews?.checkout === 'checkout_1',
		activeProductDetails: parentData.themeConfig?.pageViews?.productDetails || 'product_details_1',
		product,
		reviews: productReviews,
		relatedProducts,
		productJsonLd,
		breadcrumbsJsonLd,
		paymentConfig,
		storeConfig: parentData.storeConfig,
		productSettings: parentData.productSettings,
		websiteInfo: parentData.websiteInfo
	};
};

function describeDevice(userAgent: string, locationTag: string): string {
	const lowerUa = userAgent.toLowerCase();
	let devType = 'Desktop';
	let osType = 'OS';
	let browserType = 'Browser';
	if (/mobile|android|iphone|ipad|ipod/.test(lowerUa)) {
		devType = /ipad|tablet/.test(lowerUa) ? 'Tablet' : 'Mobile';
	}
	if (lowerUa.includes('android')) osType = 'Android';
	else if (lowerUa.includes('iphone') || lowerUa.includes('ipad')) osType = 'iOS';
	else if (lowerUa.includes('windows')) osType = 'Windows';
	else if (lowerUa.includes('macintosh')) osType = 'macOS';

	if (lowerUa.includes('chrome') && !lowerUa.includes('edg')) browserType = 'Chrome';
	else if (lowerUa.includes('safari') && !lowerUa.includes('chrome')) browserType = 'Safari';
	else if (lowerUa.includes('firefox')) browserType = 'Firefox';

	return `${devType}: ${osType} (${browserType}) • ${locationTag}`;
}

const REVIEW_LIMITS = { author: 80, title: 120, content: 2000 };

export const actions: Actions = {
	placeOrder: async ({ request, cookies, platform, getClientAddress, locals, url }) => {
		try {
			const db = getDb(platform);

			// Member login check if store theme requires login for checkout
			const themeConfig = await ThemeCustomizationService.getThemeConfig(db);
			if (themeConfig?.pageViews?.checkout === 'checkout_1' && !locals.user) {
				return fail(401, { message: 'এই স্টোরে অর্ডার সম্পন্ন করতে অ্যাকাউন্টে লগইন থাকা আবশ্যক।' });
			}

			const formData = await request.formData();

			const customerName = formData.get('customerName')?.toString()?.trim() || '';
			const customerPhone = formData.get('customerPhone')?.toString()?.trim() || '';
			const shippingAddress = formData.get('shippingAddress')?.toString()?.trim() || '';
			const deliveryArea = formData.get('deliveryArea')?.toString() || 'inside_dhaka';
			const paymentMethod = formData.get('paymentMethod')?.toString() || 'cod';
			const orderNote = formData.get('orderNote')?.toString()?.trim() || '';
			const couponCode = formData.get('couponCode')?.toString()?.trim() || '';
			const rawExpectedTotal = formData.get('expectedTotal')?.toString();

			let items: unknown;
			try {
				items = JSON.parse(formData.get('items')?.toString() || '[]');
			} catch {
				return fail(400, { message: 'কার্ট আইটেমের ডাটা সঠিক নয়।' });
			}
			if (!Array.isArray(items) || items.length === 0) {
				return fail(400, { message: 'অর্ডার করতে পণ্য নির্বাচন করুন।' });
			}

			// Fallback for digital products if address collection is disabled
			let finalShippingAddress = shippingAddress;
			if (!finalShippingAddress) {
				const productSettings = await SettingsService.getProductSettings(db);
				if (productSettings.productType === 'digital' && !productSettings.enableAddress) {
					finalShippingAddress = 'ডিজিটাল ডেলিভারি (অনলাইন)';
				}
			}

			if (!customerName || !customerPhone || !finalShippingAddress) {
				return fail(400, { message: 'নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করা আবশ্যক।' });
			}

			let ipAddress = request.headers.get('cf-connecting-ip') || '';
			if (!ipAddress) {
				try {
					ipAddress = getClientAddress();
				} catch {
					ipAddress = '127.0.0.1';
				}
			}

			const userAgent = request.headers.get('user-agent') || undefined;
			const city = request.headers.get('cf-ipcity') || '';
			const country = request.headers.get('cf-ipcountry') || 'BD';
			const locationTag = city ? `${city}, ${country}` : country;

			const result = await OrderService.createWebOrder(
				db,
				{
					customerName,
					customerPhone,
					shippingAddress: finalShippingAddress,
					deliveryArea,
					paymentMethod,
					orderNote,
					couponCode: couponCode || null,
					expectedTotal: rawExpectedTotal ? Number(rawExpectedTotal) : null,
					items,
					website_url: formData.get('website_url')?.toString()?.trim() || ''
				},
				{
					ipAddress,
					userAgent,
					source: formData.get('source')?.toString()?.slice(0, 200) || 'Product Direct Checkout',
					deviceFingerprint: describeDevice(userAgent || '', locationTag),
					userId: locals.user?.id,
					defer: (work) => platform?.ctx?.waitUntil?.(work)
				}
			);

			PixelService.dispatchOrderPurchase(db, result, {
				request,
				cookies,
				origin: url.origin,
				path: url.pathname,
				ipAddress,
				deliveryArea,
				shippingAddress: finalShippingAddress,
				waitUntil: (p) => platform?.ctx?.waitUntil?.(p)
			});

			return {
				success: true,
				orderId: result.orderId,
				orderNumber: result.orderNumber,
				total: result.total
			};
		} catch (err) {
			if (err instanceof OrderPriceChangedError) {
				return fail(409, { code: 'PRICE_CHANGED', message: err.message, total: err.total });
			}
			if (err instanceof OrderValidationError) {
				return fail(400, { message: err.message });
			}
			console.error('CRITICAL PRODUCT ORDER ERROR:', err);
			return fail(500, { message: 'অর্ডারে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
		}
	},

	addReview: async ({ request, platform }) => {
		try {
			const data = await request.formData();
			const productId = data.get('productId')?.toString()?.trim();
			const author = data.get('author')?.toString()?.trim();
			const title = data.get('title')?.toString()?.trim() || '';
			const content = data.get('content')?.toString()?.trim();
			const rating = Number(data.get('rating')?.toString() || '5');

			if (!productId || !author || !content) {
				return fail(400, { message: 'সবগুলো আবশ্যক তথ্য পূরণ করুন।' });
			}
			if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
				return fail(400, { message: 'রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে।' });
			}
			if (
				author.length > REVIEW_LIMITS.author ||
				title.length > REVIEW_LIMITS.title ||
				content.length > REVIEW_LIMITS.content
			) {
				return fail(400, { message: 'নাম, শিরোনাম বা মতামত অনেক বড়। সংক্ষেপে লিখুন।' });
			}

			const db = getDb(platform);
			const product = await db
				.select({ id: schema.products.id })
				.from(schema.products)
				.where(eq(schema.products.id, productId))
				.get();
			if (!product) {
				return fail(404, { message: 'পণ্যটি পাওয়া যায়নি।' });
			}

			// Nobody is signed in here, so the review cannot be marked as from a verified buyer.
			await ReviewService.addReview(db, {
				productId,
				author,
				rating,
				title,
				content,
				role: 'কাস্টমার',
				verified: false
			});

			return { success: true, message: 'আপনার রিভিউটি সফলভাবে গৃহীত হয়েছে!' };
		} catch (err) {
			console.error('Add review error:', err);
			return fail(500, { message: 'রিভিউ যুক্ত করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' });
		}
	}
};
