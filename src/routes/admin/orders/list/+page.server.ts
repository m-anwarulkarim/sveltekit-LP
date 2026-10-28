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
import { updateLiveOrderStatus } from '#lib/server/orders-store';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	updateOrderStatus: async ({ request, platform }) => handleUpdateStatus(request, platform),
	quickCancelOrder: async ({ request, platform }) => handleQuickCancel(request, platform),
	deleteOrder: async ({ request, platform }) => handleDeleteOrder(request, platform),

	// Single order courier booking
	bookCourier: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		const provider = (data.get('provider')?.toString() || 'Steadfast') as 'Steadfast' | 'Pathao' | 'REDX';

		if (!orderId) {
			return fail(400, { message: 'Order ID is required' });
		}

		try {
			const db = getDb(platform);
			const res = await CourierService.bookConsignment(db, orderId, provider, {
				apiKey: 'steadfast_api_live'
			});
			if (res.success) {
				updateLiveOrderStatus(orderId, 'shipped', `${provider} বুকিং: ${res.trackingCode}`);
				return {
					success: true,
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

	// Bulk courier booking
	bulkBookCourier: async ({ request, platform }) => {
		const data = await request.formData();
		const orderIdsRaw = data.get('orderIds')?.toString() || '[]';
		const provider = (data.get('provider')?.toString() || 'Steadfast') as 'Steadfast' | 'Pathao' | 'REDX';

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
			let successCount = 0;

			for (const orderId of ids) {
				const res = await CourierService.bookConsignment(db, orderId, provider, {
					apiKey: 'steadfast_api_live'
				});
				if (res.success) {
					successCount++;
					updateLiveOrderStatus(orderId, 'shipped', `${provider} বাল্ক বুকিং: ${res.trackingCode}`);
				}
			}

			return {
				success: true,
				message: `${successCount} টি অর্ডার সফলভাবে ${provider} কুরিয়ারে বুকিং সম্পন্ন হয়েছে!`
			};
		} catch (e: any) {
			console.error('Bulk courier booking error:', e);
			return fail(500, { message: e?.message || 'বাল্ক বুকিংয়ে সমস্যা হয়েছে।' });
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

			await db.update(schema.orders).set(updatePayload).where(inArray(schema.orders.id, ids));

			for (const id of ids) {
				updateLiveOrderStatus(id, targetStatus, `বাল্ক স্ট্যাটাস পরিবর্তন -> ${targetStatus}`);
			}

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

			for (const id of ids) {
				updateLiveOrderStatus(id, 'trashed', 'বাল্ক ট্র্যাশে পাঠানো হয়েছে');
			}

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
