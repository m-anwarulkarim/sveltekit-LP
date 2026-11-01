import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { OrderService } from '#lib/server/services/order.service';
import { incompleteOrderSchema } from '#lib/server/validations/order.validation';
import { parseCartItemId } from '#lib/utils/order-pricing';

function parseDeviceFromUserAgent(ua: string = '') {
	const lower = ua.toLowerCase();
	let device = 'Desktop';
	let os = 'Unknown OS';
	let browser = 'Unknown Browser';

	if (/mobile|android|iphone|ipad|ipod/.test(lower)) {
		device = /ipad|tablet/.test(lower) ? 'Tablet' : 'Mobile';
	}

	if (lower.includes('android')) os = 'Android';
	else if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('ipod')) os = 'iOS';
	else if (lower.includes('windows')) os = 'Windows';
	else if (lower.includes('macintosh') || lower.includes('mac os')) os = 'macOS';
	else if (lower.includes('linux')) os = 'Linux';

	if (lower.includes('chrome') && !lower.includes('edg')) browser = 'Chrome';
	else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';
	else if (lower.includes('firefox')) browser = 'Firefox';
	else if (lower.includes('edg')) browser = 'Edge';

	return `${device}: ${os} (${browser})`;
}

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	try {
		const parsed = incompleteOrderSchema.safeParse(await request.json());
		if (!parsed.success) {
			return json({ success: false, message: 'Invalid data' }, { status: 400 });
		}

		const body = parsed.data;
		const customerPhone = body.customerPhone;
		const customerName = body.customerName || 'অপরিচিত কাস্টমার';
		const shippingAddress = body.shippingAddress || 'ঠিকানা দেওয়া হয়নি';
		const deliveryArea = body.deliveryArea || 'inside_dhaka';
		const items = body.items ?? [];
		const subtotal = Math.round(body.subtotal ?? 0);
		const deliveryCharge = Math.round(body.deliveryCharge ?? 60);
		const total = Math.round(body.total ?? subtotal + deliveryCharge);
		const source = body.source || 'Direct';

		const db = getDb(platform);

		// Telemetry extraction
		const ipAddress = request.headers.get('cf-connecting-ip') || getClientAddress() || '127.0.0.1';
		const userAgent = request.headers.get('user-agent') || '';
		const city = request.headers.get('cf-ipcity') || '';
		const country = request.headers.get('cf-ipcountry') || 'BD';
		const locationTag = city ? `${city}, ${country}` : country;
		const deviceFingerprint = `${parseDeviceFromUserAgent(userAgent)} • ${locationTag}`;

		// Reuse this phone's open abandoned checkout, if it has one
		const existingIncomplete = await db
			.select({ id: schema.orders.id })
			.from(schema.orders)
			.where(
				and(
					eq(schema.orders.customerPhone, customerPhone),
					eq(schema.orders.status, 'incomplete'),
					eq(schema.orders.isTrashed, false)
				)
			)
			.orderBy(desc(schema.orders.createdAt))
			.limit(1)
			.get();

		if (existingIncomplete) {
			await db
				.update(schema.orders)
				.set({
					customerName,
					shippingAddress,
					deliveryArea,
					subtotal,
					deliveryCharge,
					total,
					items: JSON.stringify(items),
					source,
					ipAddress,
					userAgent,
					deviceFingerprint,
					updatedAt: new Date()
				})
				.where(eq(schema.orders.id, existingIncomplete.id));

			return json({ success: true, incompleteOrderId: existingIncomplete.id });
		}

		const nextOrderNumber = await OrderService.generateNextOrderNumber(db);
		const newOrderId = crypto.randomUUID();

		// Only link line items to products that really exist
		const requestedIds = items.flatMap((it) => {
			const raw = it.id || it.productId;
			return raw ? [parseCartItemId(raw).productId] : [];
		});
		const knownProducts =
			requestedIds.length > 0
				? await db
						.select({ id: schema.products.id })
						.from(schema.products)
						.where(inArray(schema.products.id, requestedIds))
						.all()
				: [];
		const knownProductIds = new Set(knownProducts.map((p) => p.id));

		const statements: any[] = [
			db.insert(schema.orders).values({
				id: newOrderId,
				orderNumber: nextOrderNumber,
				customerName,
				customerEmail: customerPhone,
				customerPhone,
				shippingAddress,
				deliveryArea,
				subtotal,
				deliveryCharge,
				discountAmount: 0,
				advancePayment: 0,
				dueAmount: total,
				total,
				paymentMethod: 'cod',
				paymentStatus: 'pending',
				status: 'incomplete',
				orderType: 'web',
				dropOffStage: 'checkout',
				recoveryStatus: 'uncontacted',
				source,
				ipAddress,
				userAgent,
				deviceFingerprint,
				items: JSON.stringify(items),
				isTrashed: false
			}),
			...items.map((it) => {
				const unitPrice = Math.round(it.price ?? 0);
				const quantity = it.quantity ?? 1;
				const raw = it.id || it.productId;
				const productId = raw ? parseCartItemId(raw).productId : null;
				return db.insert(schema.orderItems).values({
					id: crypto.randomUUID(),
					orderId: newOrderId,
					productId: productId && knownProductIds.has(productId) ? productId : null,
					productName: it.name || 'পণ্য',
					productImage: it.image || null,
					quantity,
					unitPrice,
					subtotal: unitPrice * quantity
				});
			})
		];
		await db.batch(statements as [any, ...any[]]);

		return json({ success: true, incompleteOrderId: newOrderId });
	} catch (e: any) {
		console.error('Failed to capture incomplete checkout order:', e);
		return json({ success: false, message: 'Server error' }, { status: 500 });
	}
};
