import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, or } from 'drizzle-orm';

/**
 * Steadfast Webhook Handler
 * Receives parcel status change events from Steadfast servers
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const payload = await request.json().catch(() => ({}));
		const consignmentId = String(payload?.consignment_id || payload?.cid || '');
		const trackingCode = String(payload?.tracking_code || '');
		const rawStatus = String(payload?.status || payload?.delivery_status || '').toLowerCase().trim();

		if (!consignmentId && !trackingCode) {
			return json({ success: false, message: 'Missing consignment_id or tracking_code' }, { status: 400 });
		}

		const db = getDb(platform);

		// Find matching order
		const order = await db
			.select()
			.from(schema.orders)
			.where(
				or(
					consignmentId ? eq(schema.orders.consignmentId, consignmentId) : undefined,
					trackingCode ? eq(schema.orders.trackingCode, trackingCode) : undefined
				)
			)
			.get();

		if (!order) {
			return json({ success: false, message: 'Order not found for given consignment' }, { status: 404 });
		}

		let newCourierStatus = order.courierStatus;
		let newOrderStatus = order.status;
		let isDelivered = false;

		if (rawStatus === 'delivered') {
			newCourierStatus = 'delivered';
			newOrderStatus = 'delivered';
			isDelivered = true;
		} else if (rawStatus === 'partial_delivered') {
			newCourierStatus = 'partial_delivered';
			newOrderStatus = 'partial_delivered';
			isDelivered = true;
		} else if (rawStatus === 'cancelled' || rawStatus === 'return' || rawStatus === 'cancelled_approval_pending') {
			newCourierStatus = 'returned';
			newOrderStatus = 'returned';
		} else if (rawStatus === 'hold') {
			newCourierStatus = 'hold';
		} else if (rawStatus === 'in_review' || rawStatus === 'pending') {
			newCourierStatus = 'in_transit';
		}

		await db
			.update(schema.orders)
			.set({
				courierStatus: newCourierStatus,
				status: newOrderStatus,
				...(isDelivered && !order.deliveredAt ? { deliveredAt: new Date() } : {}),
				updatedAt: new Date()
			})
			.where(eq(schema.orders.id, order.id));

		await db.insert(schema.orderNotes).values({
			id: crypto.randomUUID(),
			orderId: order.id,
			adminName: 'Steadfast Webhook',
			note: `কুরিয়ার ওয়েব হুক ইভেন্ট: ${rawStatus}`,
			callStatus: 'call_received'
		});

		return json({ success: true, message: 'Order status updated via webhook' });
	} catch (error: any) {
		console.error('Steadfast webhook error:', error);
		return json({ success: false, message: error.message }, { status: 500 });
	}
};

