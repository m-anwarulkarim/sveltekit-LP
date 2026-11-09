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

		const labelMap: Record<string, string> = {
			pending: 'পেন্ডিং',
			incomplete: 'ইনকমপ্লিট',
			no_response: 'নো রেসপন্স',
			good_no_response: 'গুড বাট নো রেসপন্স',
			busy: 'বিজি',
			hold: 'হোল্ড',
			recall: 'রি-কল',
			confirmed: 'কনফার্মড',
			processing: 'প্রসেসিং',
			printed: 'প্রিন্টেড',
			entry_done: 'এন্ট্রি ডান',
			shipped: 'শিপড',
			delivered: 'ডেলিভারড',
			partial_delivered: 'পার্শিয়াল',
			pending_return: 'পেন্ডিং রিটার্ন',
			returned: 'রিটার্ন',
			cancelled: 'বাতিল',
			missing: 'মিসিং'
		};
		const statusBangla = labelMap[newStatus] || newStatus;

		return {
			success: true,
			updatedOrder: orderId,
			newStatus,
			message: `অর্ডারের স্ট্যাটাস সফলভাবে "${statusBangla}" করা হয়েছে!`
		};
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

		return {
			success: true,
			confirmedOrder: orderId,
			newStatus: 'confirmed',
			message: 'অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে!'
		};
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

		return {
			success: true,
			cancelledOrder: orderId,
			newStatus: 'cancelled',
			message: 'অর্ডারটি সফলভাবে বাতিল করা হয়েছে!'
		};
	} catch (err: any) {
		console.error('Failed to cancel order in D1:', err);
		return fail(500, { message: SAVE_FAILED });
	}
}

export async function handleCreateManualOrder(request: Request, platform: any) {
	const data = await request.formData();
	const customerName = data.get('customerName')?.toString()?.trim();
	const customerPhone =
		data.get('customerPhone')?.toString()?.trim() ||
		data.get('customerEmail')?.toString()?.trim() ||
		'01700000000';
	const shippingAddress = data.get('shippingAddress')?.toString()?.trim();
	const productName = data.get('productName')?.toString()?.trim() || 'seedbd Product';
	const total = parseInt(data.get('total')?.toString() || '0', 10);
	const discountAmount = parseInt(data.get('discount')?.toString() || '0', 10);
	const deliveryCharge = parseInt(data.get('deliveryFee')?.toString() || '60', 10);
	const advancePayment = parseInt(data.get('advancePaid')?.toString() || '0', 10);
	const status = data.get('status')?.toString() || 'pending';

	if (!customerName) return fail(400, { message: 'কাস্টমার নাম আবশ্যক।' });
	if (!customerPhone || customerPhone === '01700000000') return fail(400, { message: 'কাস্টমারের ফোন নম্বর আবশ্যক।' });
	if (!shippingAddress) return fail(400, { message: 'ডেলিভারি ঠিকানা আবশ্যক।' });

	const newId = crypto.randomUUID();
	const itemsRaw = data.get('items')?.toString();

	let parsedItems: any[] = [];
	if (itemsRaw) {
		try { parsedItems = JSON.parse(itemsRaw); } catch { parsedItems = []; }
	}
	if (parsedItems.length === 0) {
		return fail(400, { message: 'অর্ডারে কমপক্ষে একটি পণ্য থাকা আবশ্যক।' });
	}
	const items = JSON.stringify(parsedItems);
	const calculatedSubtotal = parsedItems.reduce(
		(acc: number, it: any) => acc + (Number(it.price) * Number(it.quantity) || 0),
		0
	);

	// Parse call notes added before save
	let callNotes: Array<{ note: string; author: string }> = [];
	const callNotesRaw = data.get('callNotes')?.toString();
	if (callNotesRaw) {
		try { callNotes = JSON.parse(callNotesRaw); } catch { callNotes = []; }
	}

	try {
		const db = getDb(platform);
		const orderNumber = await OrderService.generateNextOrderNumber(db);

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

		// Insert creation note + any call notes added before save
		const noteRows = [
			{
				id: crypto.randomUUID(),
				orderId: newId,
				adminName: 'Admin Staff',
				note: `ম্যানুয়াল অর্ডার তৈরি করা হয়েছে। পণ্য: ${productName}`,
				callStatus: 'call_received'
			},
			...callNotes.map((n) => ({
				id: crypto.randomUUID(),
				orderId: newId,
				adminName: n.author || 'Admin Staff',
				note: n.note,
				callStatus: 'call_received'
			}))
		];
		for (const row of noteRows) {
			await db.insert(schema.orderNotes).values(row);
		}

		await NotificationService.createNotification(db, {
			title: `নতুন ম্যানুয়াল অর্ডার #${orderNumber} তৈরি হয়েছে`,
			description: `কাস্টমার ${customerName} (${customerPhone})-এর জন্য নতুন অর্ডার #${orderNumber} তৈরি হয়েছে। মোট বিল: ৳${total}।`,
			category: 'order',
			link: `/admin/orders/${newId}`
		}).catch((e) => console.error('Failed to trigger manual order notification:', e));

		return { success: true, createdOrderId: newId, orderNumber };
	} catch (err: any) {
		console.error('Failed to create manual order in D1:', err);
		return fail(500, { message: err?.message || 'অর্ডার তৈরিতে সমস্যা হয়েছে' });
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
