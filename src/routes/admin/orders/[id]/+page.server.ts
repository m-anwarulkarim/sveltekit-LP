import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { INITIAL_PRODUCTS } from '../../_data';
import { OrderService } from '#lib/server/services/order.service';
import { FraudService } from '#lib/server/services/fraud.service';
import { CourierService } from '#lib/server/services/courier.service';

export const load: PageServerLoad = async ({ params, parent, platform }) => {
	const parentData = await parent();
	const orderId = params.id;

	let foundOrder: any = null;
	let orderNotesFromDb: any[] = [];

	// 1. Query full order using OrderService from real D1
	try {
		const db = getDb(platform);
		const detailedOrder = await OrderService.getOrderById(db, orderId);
		if (detailedOrder) {
			foundOrder = detailedOrder;
			orderNotesFromDb = detailedOrder.notesList || [];
		}
	} catch (e) {
		console.error('Error fetching order from D1:', e);
	}

	// 2. Try finding in parent data
	if (!foundOrder && parentData?.orders) {
		const clean = (orderId || '').trim();
		const withoutHash = clean.replace(/^#/, '');
		foundOrder = parentData.orders.find(
			(o: any) =>
				o.id === clean ||
				o.orderNumber === clean ||
				o.orderNumber === withoutHash ||
				o.orderNumber === `#${withoutHash}`
		);
	}

	// 3. Throw 404 if order does not exist in real database (no demo data)
	if (!foundOrder) {
		throw error(404, 'অর্ডারটি ডাটাবেজে পাওয়া যায়নি।');
	}

	// Parse items
	let parsedItems: any[] = [];
	try {
		parsedItems = Array.isArray(foundOrder.items)
			? foundOrder.items
			: JSON.parse(foundOrder.items || '[]');
	} catch {
		parsedItems = [];
	}

	parsedItems = parsedItems.map((it: any) => ({
		id: it.id || 'prod-' + Math.random().toString(36).slice(2, 7),
		name: it.name || 'পণ্য আইটেম',
		price: Number(it.price) || 0,
		quantity: Number(it.quantity) || 1,
		image: it.image || '/images/products/car-paint-pen.svg',
		variant: it.variant || ''
	}));

	// Find past orders for this customer (by phone / customerEmail)
	const allOrders = parentData?.orders || [];
	const pastOrders = allOrders
		.filter((o: any) => o.customerEmail === foundOrder.customerEmail && o.id !== foundOrder.id)
		.map((o: any) => ({
			id: o.id,
			status: o.status,
			total: o.total,
			date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('bn-BD') : 'আজ'
		}));

	// Fraud & Courier Telemetry from FraudService
	let courierStats = {
		total: pastOrders.length,
		delivered: pastOrders.filter((o: any) => o.status === 'delivered').length,
		cancelled: pastOrders.filter((o: any) => o.status === 'cancelled').length,
		successRate:
			pastOrders.length > 0
				? Math.round(
						(pastOrders.filter((o: any) => o.status === 'delivered').length / pastOrders.length) * 100
					)
				: 100,
		courierName: 'Steadfast & Pathao'
	};

	try {
		const db = getDb(platform);
		const targetPhone = foundOrder.customerPhone || foundOrder.customerEmail;
		if (targetPhone) {
			const risk = await FraudService.checkPhoneRisk(db, targetPhone);
			if (risk) {
				courierStats = {
					total: risk.totalParcels,
					delivered: risk.deliveredParcels,
					cancelled: risk.cancelledParcels,
					successRate: risk.successRate,
					courierName: risk.courierName
				};
			}
		}
	} catch (e) {
		console.error('Courier stats query error in D1:', e);
	}

	const initialNotes = orderNotesFromDb.map((n) => ({
		id: n.id,
		note: n.note,
		author: n.adminName || 'Admin',
		time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString('bn-BD') : 'এখনই'
	}));

	return {
		order: foundOrder,
		orderId,
		items: parsedItems,
		pastOrders,
		courierStats,
		initialNotes,
		availableProducts: INITIAL_PRODUCTS
	};
};

export const actions: Actions = {
	saveOrder: async ({ request, platform }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId')?.toString();
		const customerName = formData.get('customerName')?.toString();
		const customerPhone = formData.get('customerPhone')?.toString();
		const shippingAddress = formData.get('shippingAddress')?.toString();
		const status = formData.get('status')?.toString() || 'pending';
		const total = parseInt(formData.get('total')?.toString() || '0', 10);
		const itemsJson = formData.get('items')?.toString() || '[]';

		if (!orderId) {
			return fail(400, { message: 'Order ID required' });
		}

		try {
			const db = getDb(platform);
			await db
				.update(schema.orders)
				.set({
					customerName: customerName || 'Unnamed Customer',
					customerEmail: customerPhone || '01700000000',
					customerPhone: customerPhone || '01700000000',
					shippingAddress: shippingAddress || 'Dhaka',
					items: itemsJson,
					total,
					status,
					updatedAt: new Date()
				})
				.where(eq(schema.orders.id, orderId));

			return { success: true, message: 'অর্ডার সফলভাবে সেভ করা হয়েছে!' };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'Database update failed' });
		}
	},

	confirmOrder: async ({ request, platform }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId')?.toString();

		if (!orderId) return fail(400, { message: 'Order ID required' });

		try {
			const db = getDb(platform);
			await OrderService.updateOrderStatus(
				db,
				{ orderId, status: 'confirmed', note: 'অর্ডারটি বিস্তারিত কনফার্ম করা হয়েছে।' },
				'Admin Staff'
			);

			return { success: true, newStatus: 'confirmed', message: 'অর্ডার কনফার্ম করা হয়েছে!' };
		} catch (err: any) {
			return fail(500, { message: err?.message });
		}
	},

	cancelOrder: async ({ request, platform }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId')?.toString();

		if (!orderId) return fail(400, { message: 'Order ID required' });

		try {
			const db = getDb(platform);
			await OrderService.updateOrderStatus(
				db,
				{ orderId, status: 'cancelled', note: 'অর্ডারটি অ্যাডমিন প্যানেল থেকে বাতিল করা হয়েছে।' },
				'Admin Staff'
			);

			return { success: true, newStatus: 'cancelled', message: 'অর্ডার বাতিল করা হয়েছে!' };
		} catch (err: any) {
			return fail(500, { message: err?.message });
		}
	},

	bookToCourier: async ({ request, platform }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId')?.toString();
		const provider = formData.get('provider')?.toString() as any;

		if (!orderId) return fail(400, { message: 'Order ID required' });

		try {
			const db = getDb(platform);
			const result = await CourierService.bookConsignment(db, orderId, provider);
			if (result.success) {
				return { success: true, trackingCode: result.trackingCode, message: result.message };
			} else {
				return fail(400, { message: result.error || 'বুকিং ব্যর্থ হয়েছে' });
			}
		} catch (err: any) {
			return fail(500, { message: err?.message || 'কুরিয়ার এন্ট্রিতে ত্রুটি' });
		}
	}
};
