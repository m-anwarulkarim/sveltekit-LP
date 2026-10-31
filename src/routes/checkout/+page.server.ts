import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { OrderService } from '#lib/server/services/order.service';
import { addLiveOrder } from '#lib/server/orders-store';
import { ThemeCustomizationService } from '#lib/server/services/theme-customization.service';
import { PixelService } from '#lib/server/services/pixel.service';
import { SettingsService } from '#lib/server/services/settings.service';
import { SecurityService } from '#lib/server/services/security.service';

export const load: PageServerLoad = async (event) => {
	const parentData = await event.parent();
	const themeConfig = parentData.themeConfig;
	const isLoginRequired = themeConfig?.pageViews?.checkout === 'checkout_1';

	let paymentConfig = {
		enableCOD: true,
		enableBkash: false,
		enableNagad: false
	};

	try {
		const db = getDb(event.platform);
		paymentConfig = await SettingsService.getPaymentConfig(db);
	} catch (e) {
		console.error('Failed to load payment config for checkout:', e);
	}

	return {
		user: event.locals.user ?? null,
		isLoginRequired,
		activeCheckout: themeConfig?.pageViews?.checkout || 'checkout_2',
		paymentConfig
	};
};

import fs from 'node:fs';

async function handlePlaceOrderAction({ request, platform, getClientAddress, locals, url }: any) {
	try {
		const db = getDb(platform);

		// Check if checkout requires member login
		try {
			const themeConfig = await ThemeCustomizationService.getThemeConfig(db);
			if (themeConfig?.pageViews?.checkout === 'checkout_1' && !locals?.user) {
				return fail(401, { message: 'এই স্টোরে অর্ডার সম্পন্ন করতে অ্যাকাউন্টে লগইন থাকা আবশ্যক।' });
			}
		} catch (err) {
			console.error('Theme check error in checkout:', err);
		}

		const formData = await request.formData();

		const customerName = formData.get('customerName')?.toString()?.trim() || '';
		const customerPhone = formData.get('customerPhone')?.toString()?.trim() || '';
		const shippingAddress = formData.get('shippingAddress')?.toString()?.trim() || '';
		const deliveryArea = (formData.get('deliveryArea')?.toString() || 'inside_dhaka') as
			| 'inside_dhaka'
			| 'outside_dhaka';
		const paymentMethod = (formData.get('paymentMethod')?.toString() || 'cod') as
			| 'cod'
			| 'bkash'
			| 'nagad'
			| 'card';
		const orderNote = formData.get('orderNote')?.toString()?.trim() || '';
		const honeypot = formData.get('website_url')?.toString()?.trim() || '';
		const itemsRaw = formData.get('items')?.toString() || '[]';

		let items: any[] = [];
		try {
			items = JSON.parse(itemsRaw);
		} catch {
			return fail(400, { message: 'কার্ট আইটেমের ডাটা সঠিক নয়।' });
		}

		if (!Array.isArray(items) || items.length === 0) {
			return fail(400, { message: 'আপনার কার্টে কোনো পণ্য নেই। অর্ডার করতে পণ্য যোগ করুন।' });
		}

		if (!customerName || !customerPhone || !shippingAddress) {
			return fail(400, { message: 'নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করা আবশ্যক।' });
		}

		// Security Sentinel: Check if client IP or customer phone is blacklisted
		let clientIp = '';
		try {
			clientIp = getClientAddress?.() || request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
		} catch {
			clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
		}
		if (clientIp.includes(',')) clientIp = clientIp.split(',')[0].trim();

		const blockCheck = await SecurityService.isBlocked(db, clientIp, customerPhone);
		if (blockCheck.blocked) {
			return fail(403, {
				message: 'নিরাপত্তা জনিত কারণে আপনার আইপি অথবা ফোন নম্বর থেকে সাময়িকভাবে অর্ডার গ্রহণ স্থগিত রাখা হয়েছে। প্রয়োজনে কাস্টমার সাপোর্টে যোগাযোগ করুন।'
			});
		}

		const payload = {
			customerName,
			customerPhone,
			shippingAddress,
			deliveryArea,
			paymentMethod,
			orderNote,
			items,
			website_url: honeypot
		};

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

		const lowerUa = (userAgent || '').toLowerCase();
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

		const deviceFingerprint = `${devType}: ${osType} (${browserType}) • ${locationTag}`;
		const source = formData.get('source')?.toString() || 'Storefront Checkout';

		const subtotal = items.reduce((acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 1), 0);
		const deliveryCharge = deliveryArea === 'inside_dhaka' ? 60 : 120;
		const total = subtotal + deliveryCharge;

		let orderId = '';
		let orderNumber = '';

		try {
			const db = getDb(platform);
			const result = await OrderService.createWebOrder(db, payload, {
				ipAddress,
				userAgent,
				source,
				deviceFingerprint
			});
			orderId = result.orderId;
			orderNumber = result.orderNumber;

			// Capture Meta Browser ID (_fbp) and Click ID (_fbc) cookies for 9.0+ EMQ
			const fbp = cookies.get('_fbp') || undefined;
			const fbc = cookies.get('_fbc') || undefined;

			// Dispatch asynchronous server-side Meta Conversions API (CAPI) Purchase event
			const capiPromise = PixelService.sendCAPIPurchase(db, {
				orderId,
				orderNumber,
				customerName,
				customerPhone,
				customerEmail: payload.customerEmail || customerPhone,
				shippingAddress,
				total,
				items,
				currency: 'BDT',
				ipAddress,
				userAgent,
				fbp,
				fbc,
				eventSourceUrl: `${url?.origin || 'https://lp.haqplus.com'}/checkout`
			}).catch((err) => console.error('Background CAPI Purchase Error:', err));

			// Ensure Cloudflare Worker execution context does not terminate before CAPI completes
			if (platform?.ctx?.waitUntil) {
				platform.ctx.waitUntil(capiPromise);
			} else if ((platform as any)?.context?.waitUntil) {
				(platform as any).context.waitUntil(capiPromise);
			}
		} catch (err: any) {
			console.error('Order creation error in D1:', err);
			return fail(400, {
				message: err?.message || 'অর্ডার সম্পন্ন করা সম্ভব হয়নি। আবার চেষ্টা করুন।'
			});
		}

		// Sync into live orders store (so it appears immediately across all admin views)
		addLiveOrder({
			id: orderId,
			orderNumber,
			customerName,
			customerEmail: customerPhone,
			customerPhone,
			shippingAddress,
			deliveryArea,
			paymentMethod,
			orderNote,
			total,
			subtotal,
			deliveryCharge,
			status: 'pending',
			orderType: 'web',
			items: JSON.stringify(items),
			createdAt: new Date().toISOString(),
			source: 'Storefront Checkout'
		});

		return {
			success: true,
			orderId,
			orderNumber,
			total
		};
	} catch (err: any) {
		fs.writeFileSync('checkout_error.log', (err && (err.stack || err.message)) || String(err));
		console.error('CRITICAL CHECKOUT ERROR:', err);
		return fail(500, {
			message: err?.message || 'অর্ডারে ত্রুটি হয়েছে।'
		});
	}
}

export const actions: Actions = {
	placeOrder: handlePlaceOrderAction
};
