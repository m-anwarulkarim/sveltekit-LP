import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { OrderService } from '#lib/server/services/order.service';

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
		const body = await request.json();
		const customerPhone = body.customerPhone?.toString()?.trim();
		const customerName = body.customerName?.toString()?.trim() || 'অপরিচিত কাস্টমার';
		const shippingAddress = body.shippingAddress?.toString()?.trim() || 'ঠিকানা দেওয়া হয়নি';
		const deliveryArea = body.deliveryArea || 'inside_dhaka';
		const items = Array.isArray(body.items) ? body.items : [];
		const subtotal = Number(body.subtotal) || 0;
		const deliveryCharge = Number(body.deliveryCharge) || 60;
		const total = Number(body.total) || (subtotal + deliveryCharge);
		const source = body.source || 'Direct';

		// Validate phone: must have at least 10 digits
		if (!customerPhone || customerPhone.replace(/\D/g, '').length < 10) {
			return json({ success: false, message: 'Invalid phone' }, { status: 400 });
		}

		const db = getDb(platform);

		// Telemetry extraction
		const ipAddress = request.headers.get('cf-connecting-ip') || getClientAddress() || '127.0.0.1';
		const userAgent = request.headers.get('user-agent') || '';
		const city = request.headers.get('cf-ipcity') || '';
		const country = request.headers.get('cf-ipcountry') || 'BD';
		const locationTag = city ? `${city}, ${country}` : country;
		const deviceFingerprint = `${parseDeviceFromUserAgent(userAgent)} • ${locationTag}`;

		// Check if an incomplete order for this phone already exists in the last 24 hours
		const existingIncomplete = await db
			.select()
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
			// Update the existing incomplete record with latest cart items & address
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

		// Insert new incomplete order
		const nextOrderNumber = await OrderService.generateNextOrderNumber(db);
		const newOrderId = crypto.randomUUID();

		await db.insert(schema.orders).values({
			id: newOrderId,
			orderNumber: nextOrderNumber,
			customerName,
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
			isTrashed: false,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		// Insert order items for relationship with defensive FK check
		for (const it of items) {
			const uPrice = Number(it.price) || 0;
			const qty = Number(it.quantity) || 1;
			const rawProdId = it.id || it.productId;

			let validProdId: string | null = null;
			if (rawProdId) {
				const prodExists = await db
					.select({ id: schema.products.id })
					.from(schema.products)
					.where(eq(schema.products.id, rawProdId))
					.get()
					.catch(() => null);
				if (prodExists) validProdId = prodExists.id;
			}

			await db.insert(schema.orderItems).values({
				id: crypto.randomUUID(),
				orderId: newOrderId,
				productId: validProdId,
				productName: it.name || 'পণ্য',
				productImage: it.image || null,
				quantity: qty,
				unitPrice: uPrice,
				subtotal: uPrice * qty
			}).catch((err) => {
				console.error('Failed to insert incomplete order item:', err);
			});
		}

		return json({ success: true, incompleteOrderId: newOrderId });
	} catch (e: any) {
		console.error('Failed to capture incomplete checkout order:', e);
		return json({ success: false, message: e?.message || 'Server error' }, { status: 500 });
	}
};

