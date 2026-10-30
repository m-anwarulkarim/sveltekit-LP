import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { LandingPageService } from '#lib/server/services/landing-page.service';
import { OrderService } from '#lib/server/services/order.service';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDb(platform);
	const landingPage = await LandingPageService.getLandingPageBySlug(db, params.slug);

	if (!landingPage) {
		throw error(404, 'ল্যান্ডিং পেজটি খুঁজে পাওয়া যায়নি');
	}

	return {
		landingPage
	};
};

export const actions: Actions = {
	placeOrder: async ({ request, platform, getClientAddress, params }) => {
		try {
			const db = getDb(platform);
			const formData = await request.formData();

			const customerName = formData.get('customerName')?.toString()?.trim() || '';
			const customerPhone = formData.get('customerPhone')?.toString()?.trim() || '';
			const shippingAddress = formData.get('shippingAddress')?.toString()?.trim() || '';
			const deliveryArea = (formData.get('deliveryArea')?.toString() || 'inside_dhaka') as
				| 'inside_dhaka'
				| 'outside_dhaka';
			const orderNote = formData.get('orderNote')?.toString()?.trim() || '';
			const quantity = Number(formData.get('quantity')) || 1;
			const price = Number(formData.get('price')) || 1200;
			const productId = formData.get('productId')?.toString() || null;
			const productName = formData.get('productName')?.toString() || 'Landing Page Product';

			if (!customerName || !customerPhone || !shippingAddress) {
				return fail(400, { message: 'নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করা আবশ্যক।' });
			}

			const items = [
				{
					id: productId || 'lp-prod',
					name: productName,
					price: price,
					quantity: quantity
				}
			];

			let ipAddress = request.headers.get('cf-connecting-ip') || '';
			if (!ipAddress) {
				try {
					ipAddress = getClientAddress();
				} catch {
					ipAddress = '127.0.0.1';
				}
			}

			const userAgent = request.headers.get('user-agent') || undefined;

			const result = await OrderService.createWebOrder(
				db,
				{
					customerName,
					customerPhone,
					shippingAddress,
					deliveryArea,
					paymentMethod: 'cod',
					orderNote: `[Landing Page: /lp/${params.slug}] ${orderNote}`.trim(),
					items
				},
				{
					ipAddress,
					userAgent,
					source: `Landing Page (/lp/${params.slug})`,
					deviceFingerprint: `Landing Page Order`
				}
			);

			return {
				success: true,
				orderId: result.orderId,
				orderNumber: result.orderNumber
			};
		} catch (e: any) {
			console.error('Landing page order failed:', e);
			return fail(500, { message: e.message || 'অর্ডার করতে সমস্যা হয়েছে' });
		}
	}
};

