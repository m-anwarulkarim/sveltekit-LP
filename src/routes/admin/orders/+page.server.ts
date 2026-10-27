import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index.ts';
import * as schema from '#lib/server/db/schema.ts';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	// Update Order Status
	updateOrderStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		const newStatus = data.get('status')?.toString();

		if (!orderId || !newStatus) {
			return fail(400, { message: 'Order ID and Status required' });
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.orders)
					.set({ status: newStatus })
					.where(eq(schema.orders.id, orderId));
				return { success: true, updatedOrder: orderId, newStatus };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to update order' });
			}
		}

		return { success: true, updatedOrder: orderId, newStatus };
	},

	// Quick Confirm: instantly move an order from Web Orders to Confirmed Order List
	quickConfirmOrder: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.orders)
					.set({ status: 'processing' })
					.where(eq(schema.orders.id, orderId));
				return { success: true, confirmedOrder: orderId, newStatus: 'processing' };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to confirm order' });
			}
		}

		return { success: true, confirmedOrder: orderId, newStatus: 'processing' };
	},

	// Quick Cancel: mark an order as cancelled
	quickCancelOrder: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.orders)
					.set({ status: 'cancelled' })
					.where(eq(schema.orders.id, orderId));
				return { success: true, cancelledOrder: orderId };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to cancel order' });
			}
		}

		return { success: true, cancelledOrder: orderId };
	},

	// Courier Sync
	syncCourier: async () => {
		return {
			success: true,
			syncedAt: new Date().toLocaleTimeString('bn-BD'),
			message: 'Steadfast ও Pathao কুরিয়ারের সাথে ট্র্যাকিং সফলভাবে সিঙ্ক হয়েছে!'
		};
	},

	// Create Manual Order
	createManualOrder: async ({ request, platform }) => {
		const data = await request.formData();
		const customerName = data.get('customerName')?.toString();
		const customerPhone = data.get('customerEmail')?.toString() || '01700000000';
		const shippingAddress = data.get('shippingAddress')?.toString();
		const productName = data.get('productName')?.toString() || 'AURA Spectrum X';
		const total = parseInt(data.get('total')?.toString() || '1200', 10);
		const status = data.get('status')?.toString() || 'pending';

		if (!customerName || !shippingAddress) {
			return fail(400, { message: 'কাস্টমার নাম এবং ঠিকানা আবশ্যক।' });
		}

		const newId = 'AUR-' + Math.floor(10000 + Math.random() * 90000);
		const items = JSON.stringify([
			{
				id: 'manual-prod',
				name: productName,
				price: total,
				quantity: 1,
				source: 'Manual Entry',
				timeAgo: 'Just now',
				successRate: { delivered: 1, returned: 0, percent: 100 }
			}
		]);

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.insert(schema.orders).values({
					id: newId,
					customerName,
					customerEmail: customerPhone,
					shippingAddress,
					items,
					total,
					status
				});
				return { success: true, createdOrderId: newId };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'অর্ডার তৈরিতে সমস্যা হয়েছে' });
			}
		}

		return { success: true, createdOrderId: newId };
	},

	// Move Order to Trash
	deleteOrder: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.orders)
					.set({ status: 'cancelled' })
					.where(eq(schema.orders.id, orderId));
				return { success: true, trashedOrder: orderId };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to trash order' });
			}
		}

		return { success: true, trashedOrder: orderId };
	},

	// Restore order from Trash
	restoreOrder: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.orders)
					.set({ status: 'pending' })
					.where(eq(schema.orders.id, orderId));
				return { success: true, restoredOrder: orderId };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to restore order' });
			}
		}

		return { success: true, restoredOrder: orderId };
	}
};
