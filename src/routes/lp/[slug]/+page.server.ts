import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { LandingPageService } from '#lib/server/services/landing-page.service';
import { AdminAuthService, ADMIN_SESSION_COOKIE } from '#lib/server/services/admin-auth.service';
import { getAuthSecret } from '#lib/server/secrets';
import { OrderService, OrderValidationError } from '#lib/server/services/order.service';
import { PixelService } from '#lib/server/services/pixel.service';
import { resolveLandingOffer } from '#lib/utils/order-pricing';
import { SeoService } from '#lib/server/services/seo.service';

/** Simple bot-detection by User-Agent — keeps view counts honest. */
function looksLikeBot(ua: string): boolean {
	return /bot|crawl|spider|slurp|facebookexternalhit|bingpreview|googlebot/i.test(ua);
}

export const load: PageServerLoad = async ({ params, platform, request, cookies, url }) => {
	const db = getDb(platform);
	const landingPage = await LandingPageService.getLandingPageBySlug(db, params.slug);

	if (!landingPage) {
		throw error(404, 'ল্যান্ডিং পেজটি খুঁজে পাওয়া যায়নি');
	}

	// Draft/Archived pages: only admins may preview; visitors get 404.
	const isPublished = landingPage.status === 'Published';
	let isAdmin = false;
	if (!isPublished) {
		const secret = getAuthSecret();
		const sessionCookie = cookies.get(ADMIN_SESSION_COOKIE);
		if (secret && sessionCookie) {
			const admin = await AdminAuthService.resolveSession(db, sessionCookie, secret);
			isAdmin = !!admin;
		}
		if (!isAdmin) {
			throw error(404, 'ল্যান্ডিং পেজটি খুঁজে পাওয়া যায়নি');
		}
	}

	// Increment views only for published pages, non-admin visitors, non-bots.
	const ua = request.headers.get('user-agent') || '';
	if (isPublished && !isAdmin && !looksLikeBot(ua)) {
		// Fire and forget — don't block page render.
		platform?.ctx?.waitUntil?.(LandingPageService.incrementViews(db, landingPage.id));
	}

	// Build rich SEO & OpenGraph Social Sharing Metadata
	const siteUrl = url.origin;
	const product = landingPage.product;
	const title = landingPage.title || landingPage.config?.headline || 'ল্যান্ডিং পেজ';
	const description =
		landingPage.config?.subheadline ||
		landingPage.config?.headline ||
		(product?.description ? product.description.slice(0, 160) : '') ||
		`${title} - কিনুন বিশেষ অফার মূল্যে seedbd থেকে।`;

	const heroImage =
		landingPage.config?.heroImage ||
		product?.image ||
		landingPage.config?.galleryImages?.[0] ||
		`${siteUrl}/apple-touch-icon.png`;

	const ogImage = heroImage.startsWith('http') ? heroImage : `${siteUrl}${heroImage}`;
	const canonicalUrl = `${siteUrl}/lp/${params.slug}`;
	const effectivePrice = landingPage.config?.customPrice || product?.price || 0;
	const effectiveRegularPrice = landingPage.config?.customRegularPrice || product?.originalPrice || 0;

	const landingJsonLd = SeoService.getLandingPageJsonLd(
		{
			name: title,
			description,
			slug: params.slug,
			price: effectivePrice,
			regularPrice: effectiveRegularPrice,
			image: ogImage,
			inStock: product ? product.inStock : true,
			brandName: 'seedbd'
		},
		siteUrl
	);

	const seoMeta = {
		title: `${title} | seedbd`,
		description,
		ogImage,
		canonicalUrl,
		price: effectivePrice
	};

	// Visitors must not receive the cost price.
	if (landingPage.product) {
		const { costPrice: _costPrice, ...publicProduct } = landingPage.product;
		return {
			landingPage: { ...landingPage, product: publicProduct },
			isAdmin,
			seoMeta,
			landingJsonLd
		};
	}

	return { landingPage, isAdmin, seoMeta, landingJsonLd };
};

export const actions: Actions = {
	placeOrder: async ({ request, cookies, platform, getClientAddress, params, locals, url }) => {
		try {
			const db = getDb(platform);
			const formData = await request.formData();

			const landingPage = await LandingPageService.getLandingPageBySlug(db, params.slug);
			if (!landingPage) {
				return fail(404, { message: 'ল্যান্ডিং পেজটি খুঁজে পাওয়া যায়নি' });
			}

			// Only Published pages can accept orders.
			if (landingPage.status !== 'Published') {
				return fail(400, { message: 'এই পেজটি এখন অর্ডার গ্রহণ করছে না।' });
			}

			const customerName = formData.get('customerName')?.toString()?.trim() || '';
			const customerPhone = formData.get('customerPhone')?.toString()?.trim() || '';
			const shippingAddress = formData.get('shippingAddress')?.toString()?.trim() || '';
			const deliveryArea =
				formData.get('deliveryArea')?.toString() === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka';
			const orderNote = formData.get('orderNote')?.toString()?.trim() || '';
			const rawPackageIndex = formData.get('packageIndex')?.toString();

			if (!customerName || !customerPhone || !shippingAddress) {
				return fail(400, { message: 'নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করা আবশ্যক।' });
			}

			// The price comes from the saved landing page, never from the submitted form.
			const product = landingPage.product;
			const offer = resolveLandingOffer({
				template: landingPage.template,
				customPrice: landingPage.config?.customPrice,
				productPrice: product?.price,
				packages: landingPage.config?.packages as any,
				packageIndex: rawPackageIndex ? Number(rawPackageIndex) : null,
				quantity: Number(formData.get('quantity')) || 1,
				deliveryArea
			});

			const productName = product?.name || landingPage.config?.headline || landingPage.title;
			const displayName = offer.packageTitle ? `${productName} (${offer.packageTitle})` : productName;

			let ipAddress = request.headers.get('cf-connecting-ip') || '';
			if (!ipAddress) {
				try {
					ipAddress = getClientAddress();
				} catch {
					ipAddress = '127.0.0.1';
				}
			}

			const result = await OrderService.createWebOrder(
				db,
				{
					customerName,
					customerPhone,
					shippingAddress,
					deliveryArea,
					paymentMethod: 'cod',
					orderNote: `[Landing Page: /lp/${params.slug}] ${orderNote}`.trim(),
					website_url: formData.get('website_url')?.toString() || '',
					items: [{ id: product?.id || 'lp-prod', quantity: offer.quantity }]
				},
				{
					ipAddress,
					userAgent: request.headers.get('user-agent') || undefined,
					source: `Landing Page (/lp/${params.slug})`,
					deviceFingerprint: 'Landing Page Order',
					userId: locals.user?.id,
					defer: (work) => platform?.ctx?.waitUntil?.(work),
					landingOffer: {
						productId: product?.id || null,
						productName: displayName,
						image: product?.image || null,
						unitPrice: offer.unitPrice,
						quantity: offer.quantity,
						subtotal: offer.subtotal,
						deliveryCharge: offer.deliveryCharge
					}
				}
			);

			// Track conversion atomically (fire and forget).
			platform?.ctx?.waitUntil?.(LandingPageService.incrementConversions(db, landingPage.id));

			PixelService.dispatchOrderPurchase(db, result, {
				request,
				cookies,
				origin: url.origin,
				path: `/lp/${params.slug}`,
				ipAddress,
				deliveryArea,
				shippingAddress,
				waitUntil: (p) => platform?.ctx?.waitUntil?.(p)
			});

			return {
				success: true,
				orderId: result.orderId,
				orderNumber: result.orderNumber,
				total: result.total
			};
		} catch (e) {
			console.error('Landing page order failed:', e);
			if (e instanceof OrderValidationError) {
				return fail(400, { message: e.message });
			}
			return fail(500, { message: 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' });
		}
	}
};
