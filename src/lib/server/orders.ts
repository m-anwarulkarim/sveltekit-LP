import { getDb } from '#lib/server/db/index.ts';
import * as schema from '#lib/server/db/schema.ts';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export async function handleUpdateStatus(request: Request, platform: any) {
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
}

export async function handleQuickConfirm(request: Request, platform: any) {
	const data = await request.formData();
	const orderId = data.get('orderId')?.toString();
	if (!orderId) return fail(400, { message: 'Order ID required' });

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			await db.update(schema.orders)
				.set({ status: 'confirmed' })
				.where(eq(schema.orders.id, orderId));
			return { success: true, confirmedOrder: orderId };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'Failed to confirm order' });
		}
	}

	return { success: true, confirmedOrder: orderId };
}

export async function handleQuickCancel(request: Request, platform: any) {
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
}

export async function handleCreateManualOrder(request: Request, platform: any) {
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
}

export async function handleDeleteOrder(request: Request, platform: any) {
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
}

export async function handleRestoreOrder(request: Request, platform: any) {
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

export async function handlePermanentDelete(request: Request, platform: any) {
	const data = await request.formData();
	const orderId = data.get('orderId')?.toString();
	if (!orderId) return fail(400, { message: 'Order ID required' });

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			await db.delete(schema.orders).where(eq(schema.orders.id, orderId));
			return { success: true, deletedOrder: orderId };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'Failed to permanently delete order' });
		}
	}

	return { success: true, deletedOrder: orderId };
}

export async function handleEmptyTrash(platform: any) {
	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			await db.delete(schema.orders).where(eq(schema.orders.status, 'cancelled'));
			return { success: true, emptied: true };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'Failed to empty trash' });
		}
	}

	return { success: true, emptied: true };
}
