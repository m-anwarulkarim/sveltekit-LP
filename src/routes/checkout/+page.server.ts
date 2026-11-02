import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import {
	OrderService,
	OrderPriceChangedError,
	OrderValidationError
} from '#lib/server/services/order.service';
import { ThemeCustomizationService } from '#lib/server/services/theme-customization.service';
import { PixelService } from '#lib/server/services/pixel.service';
import { SettingsService, DEFAULT_ADVANCE_PAYMENT } from '#lib/server/services/settings.service';

export const load: PageServerLoad = async (event) => {
	const parentData = await event.parent();
	const themeConfig = parentData.themeConfig;
	const isLoginRequired = themeConfig?.pageViews?.checkout === 'checkout_1';

	// Only on/off flags reach the browser: never gateway keys or passwords.
	let paymentConfig = {
		enableCOD: true,
		enableBkash: false,
		enableNagad: false
	};
	let advancePaymentConfig = { ...DEFAULT_ADVANCE_PAYMENT };
	let manageOffers: any[] = [];
	let orderSettings = null;

	try {
		const db = getDb(event.platform);
		const [pCfg, aCfg, mOffers, oSettings] = await Promise.all([
			SettingsService.getPaymentConfig(db),
			SettingsService.getAdvancePaymentConfig(db),
			SettingsService.getManageOffers(db),
			SettingsService.getOrderSettings(db)
		]);
		if (pCfg) {
			paymentConfig = {
				enableCOD: pCfg.enableCOD,
				enableBkash: pCfg.enableBkash,
				enableNagad: pCfg.enableNagad
			};
		}
		if (aCfg) advancePaymentConfig = aCfg;
		if (mOffers) manageOffers = mOffers;
		if (oSettings) orderSettings = oSettings;
	} catch (e) {
		console.error('Failed to load payment config for checkout:', e);
	}

	return {
		user: event.locals.user ?? null,
		isLoginRequired,
		activeCheckout: themeConfig?.pageViews?.checkout || 'checkout_2',
		paymentConfig,
		advancePaymentConfig,
		manageOffers,
		orderSettings
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

export const actions: Actions = {
	placeOrder: async ({ request, cookies, platform, getClientAddress, locals, url }) => {
		try {
			const db = getDb(platform);

			// Check if checkout requires member login
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
				return fail(400, { message: 'আপনার কার্টে কোনো পণ্য নেই। অর্ডার করতে পণ্য যোগ করুন।' });
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
					source: formData.get('source')?.toString()?.slice(0, 200) || 'Storefront Checkout',
					deviceFingerprint: describeDevice(userAgent || '', locationTag),
					userId: locals.user?.id,
					defer: (work) => platform?.ctx?.waitUntil?.(work)
				}
			);

			// Dispatch asynchronous server-side Meta Conversions API (CAPI) Purchase event
			try {
				const capiPromise = PixelService.sendCAPIPurchase(db, {
					orderId: result.orderId,
					orderNumber: result.orderNumber,
					customerName: result.customerName,
					customerPhone: result.customerPhone,
					customerEmail: result.customerPhone,
					shippingAddress: finalShippingAddress,
					total: result.total,
					items: result.items,
					currency: 'BDT',
					ipAddress,
					userAgent,
					// Meta Browser ID and Click ID cookies improve event match quality
					fbp: cookies.get('_fbp') || undefined,
					fbc: cookies.get('_fbc') || undefined,
					eventSourceUrl: `${url.origin}/checkout`
				}).catch((err) => console.error('Background CAPI Purchase Error:', err));

				// Keep the Worker alive until CAPI completes
				platform?.ctx?.waitUntil?.(capiPromise);
			} catch (capiErr) {
				console.error('CAPI dispatch init error:', capiErr);
			}

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
			console.error('CRITICAL CHECKOUT ERROR:', err);
			return fail(500, { message: 'অর্ডারে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
		}
	}
};
