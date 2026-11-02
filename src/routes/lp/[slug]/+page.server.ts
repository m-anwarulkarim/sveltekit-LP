import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { LandingPageService } from '#lib/server/services/landing-page.service';
import { OrderService, OrderValidationError } from '#lib/server/services/order.service';
import { resolveLandingOffer } from '#lib/utils/order-pricing';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDb(platform);
	const landingPage = await LandingPageService.getLandingPageBySlug(db, params.slug);

	if (!landingPage) {
		throw error(404, 'ল্যান্ডিং পেজটি খুঁজে পাওয়া যায়নি');
	}

	// Visitors must not receive the cost price.
	if (landingPage.product) {
		const { costPrice: _costPrice, ...publicProduct } = landingPage.product;
		return { landingPage: { ...landingPage, product: publicProduct } };
	}

	return { landingPage };
};

export const actions: Actions = {
	placeOrder: async ({ request, platform, getClientAddress, params, locals }) => {
		try {
			const db = getDb(platform);
			const formData = await request.formData();

			const landingPage = await LandingPageService.getLandingPageBySlug(db, params.slug);
			if (!landingPage) {
				return fail(404, { message: 'ল্যান্ডিং পেজটি খুঁজে পাওয়া যায়নি' });
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
