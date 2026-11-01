import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { OrderService } from './services/order.service';
import { CustomerService } from './services/customer.service';
import { NotificationService } from './services/notification.service';
import { StockService } from './services/stock.service';

/**
 * Enterprise Admin Order Actions Controller
 * Connects directly to Cloudflare D1. A database failure is always reported as a
 * failure, so the admin never sees a change that was not saved.
 */

const SAVE_FAILED = 'ডাটাবেসে সেভ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।';

async function findOrder(db: ReturnType<typeof getDb>, orderId: string) {
	return await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
}

export async function handleUpdateStatus(request: Request, platform: any) {
	const data = await request.formData();
	const orderId = data.get('orderId')?.toString();
	const newStatus = data.get('status')?.toString();
	const note = data.get('note')?.toString() || '';

	if (!orderId || !newStatus) {
		return fail(400, { message: 'Order ID and Status required' });
	}

	try {
		const db = getDb(platform);
		const order = await findOrder(db, orderId);
		if (!order) return fail(404, { message: 'অর্ডার পাওয়া যায়নি' });

		const updatePayload: Record<string, any> = {
			status: newStatus,
			updatedAt: new Date()
		};

		if (newStatus === 'confirmed' || newStatus === 'processing') {
			updatePayload.confirmedAt = new Date();
		} else if (newStatus === 'shipped') {
			updatePayload.shippedAt = new Date();
		} else if (newStatus === 'delivered') {
			updatePayload.deliveredAt = new Date();
		}

		await StockService.syncForStatusChange(db, order, newStatus);
		await db.update(schema.orders).set(updatePayload).where(eq(schema.orders.id, orderId));

		if (note.trim().length > 0) {
			await db.insert(schema.orderNotes).values({
				id: crypto.randomUUID(),
				orderId,
				adminName: 'Admin Staff',
				note: `স্ট্যাটাস পরিবর্তন: ${newStatus}। ${note.trim()}`,
				callStatus: 'call_received'
			});
		}

		return { success: true, updatedOrder: orderId, newStatus };
	} catch (err: any) {
		console.error('Failed to update order status:', err);
		return fail(500, { message: SAVE_FAILED });
	}
}

export async function handleQuickConfirm(request: Request, platform: any) {
	const data = await request.formData();
	const orderId = data.get('orderId')?.toString();
	if (!orderId) return fail(400, { message: 'Order ID required' });

	try {
		const db = getDb(platform);
		const order = await findOrder(db, orderId);
		if (!order) return fail(404, { message: 'অর্ডার পাওয়া যায়নি' });

		await StockService.syncForStatusChange(db, order, 'confirmed');
		await db
			.update(schema.orders)
			.set({
				status: 'confirmed',
				confirmedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(schema.orders.id, orderId));

		await db.insert(schema.orderNotes).values({
			id: crypto.randomUUID(),
			orderId,
			adminName: 'Admin Staff',
			note: 'কুইক কনফার্ম: অর্ডারটি সরাসরি কনফার্ম করা হয়েছে।',
			callStatus: 'confirmed'
		});

		return { success: true, confirmedOrder: orderId, newStatus: 'confirmed' };
	} catch (err: any) {
		console.error('Failed to confirm order in D1:', err);
		return fail(500, { message: SAVE_FAILED });
	}
}

export async function handleQuickCancel(request: Request, platform: any) {
	const data = await request.formData();
	const orderId = data.get('orderId')?.toString();
	const reason = data.get('reason')?.toString() || 'Admin Quick Cancel';

	if (!orderId) return fail(400, { message: 'Order ID required' });

	try {
		const db = getDb(platform);
		const order = await findOrder(db, orderId);
		if (!order) return fail(404, { message: 'অর্ডার পাওয়া যায়নি' });

		await StockService.syncForStatusChange(db, order, 'cancelled');
		await db
			.update(schema.orders)
			.set({
				status: 'cancelled',
				updatedAt: new Date()
			})
			.where(eq(schema.orders.id, orderId));

		await db.insert(schema.orderNotes).values({
			id: crypto.randomUUID(),
			orderId,
			adminName: 'Admin Staff',
			note: `অর্ডার বাতিল: ${reason}`,
			callStatus: 'not_answering'
		});

		return { success: true, cancelledOrder: orderId };
	} catch (err: any) {
		console.error('Failed to cancel order in D1:', err);
		return fail(500, { message: SAVE_FAILED });
	}
}

export async function handleCreateManualOrder(request: Request, platform: any) {
	const data = await request.formData();
	const customerName = data.get('customerName')?.toString()?.trim();
	const customerPhone =
		data.get('customerEmail')?.toString()?.trim() ||
		data.get('customerPhone')?.toString()?.trim() ||
		'01700000000';
	const shippingAddress = data.get('shippingAddress')?.toString()?.trim();
	const productName = data.get('productName')?.toString()?.trim() || 'AURA Spectrum X';
	const total = parseInt(data.get('total')?.toString() || '1200', 10);
	const discountAmount = parseInt(data.get('discount')?.toString() || '0', 10);
	const deliveryCharge = parseInt(data.get('deliveryFee')?.toString() || '60', 10);
	const advancePayment = parseInt(data.get('advancePaid')?.toString() || '0', 10);
	const status = data.get('status')?.toString() || 'pending';

	if (!customerName || !shippingAddress) {
		return fail(400, { message: 'কাস্টমার নাম এবং ঠিকানা আবশ্যক।' });
	}

	const newId = crypto.randomUUID();
	const items =
		data.get('items')?.toString() ||
		JSON.stringify([
			{
				id: 'manual-prod',
				name: productName,
				price: total,
				quantity: 1,
				source: 'Manual Entry'
			}
		]);

	let parsedItems: any[] = [];
	try {
		parsedItems = JSON.parse(items);
	} catch {
		parsedItems = [];
	}
	const calculatedSubtotal = parsedItems.reduce(
		(acc: number, it: any) => acc + (Number(it.price) * Number(it.quantity) || 0),
		0
	);

	try {
		const db = getDb(platform);
		const orderNumber = await OrderService.generateNextOrderNumber(db);

		// Upsert customer in real D1 database
		const customer = await CustomerService.getOrCreateCustomer(db, {
			name: customerName,
			phone: customerPhone,
			address: shippingAddress
		});

		await db.insert(schema.orders).values({
			id: newId,
			orderNumber,
			customerId: customer.id,
			customerName,
			customerEmail: customerPhone,
			customerPhone,
			shippingAddress,
			items,
			total,
			subtotal: calculatedSubtotal || total,
			discountAmount,
			deliveryCharge,
			advancePayment,
			status,
			orderType: 'manual',
			source: 'Manual Entry'
		});

		await db.insert(schema.orderNotes).values({
			id: crypto.randomUUID(),
			orderId: newId,
			adminName: 'Admin Staff',
			note: `ম্যানুয়াল অর্ডার তৈরি করা হয়েছে। পণ্য: ${productName}`,
			callStatus: 'call_received'
		});

		// Trigger real admin notification
		await NotificationService.createNotification(db, {
			title: `নতুন ম্যানুয়াল অর্ডার #${orderNumber} তৈরি হয়েছে`,
			description: `কাস্টমার ${customerName} (${customerPhone})-এর জন্য নতুন অর্ডার #${orderNumber} তৈরি হয়েছে। মোট বিল: ৳${total}।`,
			category: 'order',
			link: `/admin/orders/${newId}`
		}).catch((e) => console.error('Failed to trigger manual order notification:', e));

		return { success: true, createdOrderId: newId, orderNumber };
	} catch (err: any) {
		console.error('Failed to create manual order in D1:', err);
		return fail(500, { message: 'অর্ডার তৈরিতে সমস্যা হয়েছে' });
	}
}

export async function handleDeleteOrder(request: Request, platform: any) {
	const data = await request.formData();
	const orderId = data.get('orderId')?.toString();
	if (!orderId) return fail(400, { message: 'Order ID required' });

	try {
		const db = getDb(platform);
		// Soft delete in real D1
		await db
			.update(schema.orders)
			.set({
				isTrashed: true,
				updatedAt: new Date()
			})
			.where(eq(schema.orders.id, orderId));

		return { success: true, trashedOrder: orderId };
	} catch (err: any) {
		console.error('Failed to trash order in D1:', err);
		return fail(500, { message: SAVE_FAILED });
	}
}

export async function handleRestoreOrder(request: Request, platform: any) {
	const data = await request.formData();
	const orderId = data.get('orderId')?.toString();
	if (!orderId) return fail(400, { message: 'Order ID required' });

	try {
		const db = getDb(platform);
		const order = await findOrder(db, orderId);
		if (!order) return fail(404, { message: 'অর্ডার পাওয়া যায়নি' });

		await StockService.syncForStatusChange(db, order, 'pending');
		await db
			.update(schema.orders)
			.set({
				isTrashed: false,
				status: 'pending',
				updatedAt: new Date()
			})
			.where(eq(schema.orders.id, orderId));

		return { success: true, restoredOrder: orderId };
	} catch (err: any) {
		console.error('Failed to restore order in D1:', err);
		return fail(500, { message: SAVE_FAILED });
	}
}

export async function handlePermanentDelete(request: Request, platform: any) {
	const data = await request.formData();
	const orderId = data.get('orderId')?.toString();
	if (!orderId) return fail(400, { message: 'Order ID required' });

	try {
		const db = getDb(platform);
		await db.delete(schema.orders).where(eq(schema.orders.id, orderId));
		return { success: true, deletedOrder: orderId };
	} catch (err: any) {
		console.error('Failed to permanently delete order in D1:', err);
		return fail(500, { message: SAVE_FAILED });
	}
}

export async function handleEmptyTrash(platform: any) {
	try {
		const db = getDb(platform);
		await db.delete(schema.orders).where(eq(schema.orders.isTrashed, true));
		return { success: true, emptied: true };
	} catch (err: any) {
		console.error('Failed to empty trash in D1:', err);
		return fail(500, { message: SAVE_FAILED });
	}
}

export async function handleConvertIncompleteToOrder(request: Request, platform: any) {
	const data = await request.formData();
	const orderId = data.get('orderId')?.toString();
	const shippingAddress = data.get('shippingAddress')?.toString();
	const customerName = data.get('customerName')?.toString();

	if (!orderId) return fail(400, { message: 'Order ID required' });

	try {
		const db = getDb(platform);
		const order = await findOrder(db, orderId);
		if (!order) return fail(404, { message: 'অর্ডার পাওয়া যায়নি' });

		const updatePayload: Record<string, any> = {
			status: 'confirmed',
			isTrashed: false,
			confirmedAt: new Date(),
			updatedAt: new Date(),
			recoveryStatus: 'converted'
		};
		if (shippingAddress) updatePayload.shippingAddress = shippingAddress;
		if (customerName) updatePayload.customerName = customerName;

		await StockService.syncForStatusChange(db, order, 'confirmed');
		await db.update(schema.orders).set(updatePayload).where(eq(schema.orders.id, orderId));

		await db.insert(schema.orderNotes).values({
			id: crypto.randomUUID(),
			orderId,
			adminName: 'Admin Staff',
			note: 'ড্রপ-অফ লিড সফলভাবে কনভার্ট করে কনফার্মড অর্ডারে রূপান্তর করা হয়েছে।',
			callStatus: 'call_received'
		});

		return { success: true, convertedOrder: orderId, newStatus: 'confirmed' };
	} catch (err: any) {
		console.error('Failed to convert order in D1:', err);
		return fail(500, { message: SAVE_FAILED });
	}
}

export async function handleUpdateIncompleteOrder(request: Request, platform: any) {
	const data = await request.formData();
	const orderId = data.get('orderId')?.toString();
	const customerName = data.get('customerName')?.toString();
	const customerPhone = data.get('customerPhone')?.toString();
	const shippingAddress = data.get('shippingAddress')?.toString();
	const totalStr = data.get('total')?.toString();
	const notes = data.get('notes')?.toString() || '';
	const recoveryStatus = data.get('recoveryStatus')?.toString() || 'uncontacted';
	const dropOffStage = data.get('dropOffStage')?.toString() || 'Step 2: ফর্ম অসম্পূর্ণ';

	if (!orderId) return fail(400, { message: 'Order ID required' });

	try {
		const db = getDb(platform);
		const existing = await findOrder(db, orderId);

		let currentItems: any[] = [];
		try {
			currentItems = existing ? JSON.parse(existing.items) : [];
		} catch {
			currentItems = [];
		}

		if (currentItems.length > 0) {
			currentItems[0].notes = notes;
			currentItems[0].recoveryStatus = recoveryStatus;
			currentItems[0].dropOffStage = dropOffStage;
		}

		const updatePayload: Record<string, any> = {
			items: JSON.stringify(currentItems),
			recoveryStatus,
			dropOffStage,
			updatedAt: new Date()
		};
		if (customerName) updatePayload.customerName = customerName;
		if (customerPhone) {
			updatePayload.customerPhone = customerPhone;
			updatePayload.customerEmail = customerPhone;
		}
		if (shippingAddress) updatePayload.shippingAddress = shippingAddress;
		if (totalStr) updatePayload.total = parseInt(totalStr, 10);

		await db.update(schema.orders).set(updatePayload).where(eq(schema.orders.id, orderId));

		if (notes.trim().length > 0) {
			await db.insert(schema.orderNotes).values({
				id: crypto.randomUUID(),
				orderId,
				adminName: 'Admin Staff',
				note: `ফলো-আপ নোট: ${notes.trim()}`,
				callStatus: 'call_received'
			});
		}

		return { success: true, updatedOrder: orderId };
	} catch (err: any) {
		console.error('Failed to update incomplete order in D1:', err);
		return fail(500, { message: SAVE_FAILED });
	}
}
