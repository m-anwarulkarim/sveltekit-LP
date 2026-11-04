import { OrderService } from '#lib/server/services/order.service';
import type { Actions, PageServerLoad } from './$types';
import {
	handleUpdateStatus,
	handleQuickCancel,
	handleDeleteOrder
} from '#lib/server/orders';
import { CourierService } from '#lib/server/services/courier.service';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { StockService } from '#lib/server/services/stock.service';
import { fail } from '@sveltejs/kit';
import { hasMenuAccess } from '#lib/constants/admin-permissions';

export const load: PageServerLoad = async ({ platform }) => {
	return {
		orders: await OrderService.listAdminOrders(getDb(platform), 'active')
	};
};

export const actions: Actions = {
	updateOrderStatus: async ({ request, platform }) => handleUpdateStatus(request, platform),
	quickCancelOrder: async ({ request, platform }) => handleQuickCancel(request, platform),
	deleteOrder: async ({ request, platform }) => handleDeleteOrder(request, platform),

	// Single order courier booking
	bookCourier: async ({ request, platform, locals }) => {
		if (!hasMenuAccess(locals.admin?.permissions, 'orders')) {
			return fail(403, { message: 'অর্ডার ম্যানেজ করার অনুমতি আপনার নেই।' });
		}
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		const provider = (data.get('provider')?.toString() || 'Steadfast') as 'Steadfast' | 'Pathao' | 'REDX';

		if (!orderId) {
			return fail(400, { message: 'Order ID is required' });
		}

		try {
			const db = getDb(platform);
			const res = await CourierService.bookConsignment(db, orderId, provider.toLowerCase() as any);
			if (res.success) {
				return {
					success: true,
					trackingCode: res.trackingCode,
					message: `অর্ডারটি সফলভাবে ${provider} কুরিয়ারে বুকিং সম্পন্ন হয়েছে! ট্র্যাকিং কোড: ${res.trackingCode}`
				};
			} else {
				return fail(400, { message: res.error || 'কুরিয়ার বুকিং ব্যর্থ হয়েছে' });
			}
		} catch (e: any) {
			console.error('Courier booking failed:', e);
			return fail(500, { message: e?.message || 'কুরিয়ার বুকিংয়ে সার্ভার সমস্যা হয়েছে' });
		}
	},

	// Bulk status update
	bulkUpdateStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const orderIdsRaw = data.get('orderIds')?.toString() || '[]';
		const targetStatus = data.get('status')?.toString();

		if (!targetStatus) {
			return fail(400, { message: 'নতুন স্ট্যাটাস নির্বাচন করুন।' });
		}

		let ids: string[] = [];
		try {
			ids = JSON.parse(orderIdsRaw);
		} catch {
			ids = orderIdsRaw.split(',').map((s) => s.trim()).filter(Boolean);
		}

		if (ids.length === 0) {
			return fail(400, { message: 'কোনো অর্ডার নির্বাচন করা হয়নি।' });
		}

		try {
			const db = getDb(platform);
			const updatePayload: Record<string, any> = {
				status: targetStatus,
				updatedAt: new Date()
			};
			if (targetStatus === 'confirmed') updatePayload.confirmedAt = new Date();
			if (targetStatus === 'shipped') updatePayload.shippedAt = new Date();
			if (targetStatus === 'delivered') updatePayload.deliveredAt = new Date();

			const orders = await db.select().from(schema.orders).where(inArray(schema.orders.id, ids)).all();
			for (const order of orders) {
				await StockService.syncForStatusChange(db, order, targetStatus);
			}

			await db.update(schema.orders).set(updatePayload).where(inArray(schema.orders.id, ids));

			return {
				success: true,
				message: `${ids.length} টি অর্ডারের স্ট্যাটাস সফলভাবে "${targetStatus}" করা হয়েছে!`
			};
		} catch (e: any) {
			console.error('Bulk status update error:', e);
			return fail(500, { message: e?.message || 'বাল্ক স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে।' });
		}
	},

	// Bulk delete / trash
	bulkDeleteOrders: async ({ request, platform }) => {
		const data = await request.formData();
		const orderIdsRaw = data.get('orderIds')?.toString() || '[]';

		let ids: string[] = [];
		try {
			ids = JSON.parse(orderIdsRaw);
		} catch {
			ids = orderIdsRaw.split(',').map((s) => s.trim()).filter(Boolean);
		}

		if (ids.length === 0) {
			return fail(400, { message: 'কোনো অর্ডার নির্বাচন করা হয়নি।' });
		}

		try {
			const db = getDb(platform);
			await db
				.update(schema.orders)
				.set({
					isTrashed: true,
					updatedAt: new Date()
				})
				.where(inArray(schema.orders.id, ids));

			return {
				success: true,
				message: `${ids.length} টি অর্ডার সফলভাবে ট্র্যাশে পাঠানো হয়েছে!`
			};
		} catch (e: any) {
			console.error('Bulk delete error:', e);
			return fail(500, { message: e?.message || 'অর্ডার ট্র্যাশে পাঠাতে সমস্যা হয়েছে।' });
		}
	}
};
