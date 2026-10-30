import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { ProductService } from '#lib/server/services/product.service';
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
		image: it.image || '',
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

	// Fraud & Courier Telemetry from FraudService (Dynamically checking Steadfast / Pathao / Local)
	let courierStats: any = {
		total: 0,
		delivered: 0,
		cancelled: 0,
		successRate: 100,
		courierName: 'কুরিয়ার ডেটা যাচাই হচ্ছে...',
		badgeLabel: 'COURIER',
		isConfigured: false
	};

	let courierSettings = { methods: [] as any[], defaultProvider: 'steadfast' as any };
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
					courierName: risk.courierName,
					badgeLabel: risk.badgeLabel,
					isConfigured: risk.isConfigured
				};
			}
		}

		// Load configured courier methods
		courierSettings = await CourierService.getCourierSettings(db);
	} catch (e) {
		console.error('Courier stats / settings query error in D1:', e);
	}

	// Fetch real database products from D1 for upsell catalog
	let realProducts: any[] = [];
	try {
		const db = getDb(platform);
		realProducts = await ProductService.listProducts(db);
	} catch (e) {
		console.error('Failed to load products from D1 in admin/orders/[id]:', e);
	}

	const initialNotes = orderNotesFromDb.map((n) => {
		const d = n.createdAt ? new Date(n.createdAt) : null;
		return {
			id: n.id,
			note: n.note,
			author: n.adminName || 'Admin Staff',
			time: d && !isNaN(d.getTime()) ? d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : 'এখনই'
		};
	});

	const visitorMeta = {
		source: foundOrder.source || 'Storefront Checkout',
		fingerprint: foundOrder.deviceFingerprint || 'অনুপলব্ধ',
		ip: foundOrder.ipAddress || 'রেকর্ড করা হয়নি',
		device: foundOrder.deviceFingerprint || (foundOrder.userAgent ? (foundOrder.userAgent.includes('Mobile') ? 'মোবাইল ব্রাউজার' : 'ডেস্কটপ ব্রাউজার') : 'ওয়েব ব্রাউজার'),
		totalVisits: pastOrders.length + 1,
		activeTime: pastOrders.length === 0 ? 'নতুন গ্রাহক' : `${pastOrders.length + 1}ম অর্ডার`,
		avgLoad: 'N/A',
		firstVisit: foundOrder.createdAt ? new Date(foundOrder.createdAt).toLocaleDateString('bn-BD') : 'আজ'
	};

	return {
		order: foundOrder,
		orderId,
		items: parsedItems,
		pastOrders,
		courierStats,
		initialNotes,
		availableProducts: realProducts,
		visitorMeta,
		courierMethods: courierSettings.methods,
		defaultCourier: courierSettings.defaultProvider
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
		const discountAmount = parseInt(formData.get('discount')?.toString() || '0', 10);
		const deliveryCharge = parseInt(formData.get('deliveryFee')?.toString() || '60', 10);
		const advancePayment = parseInt(formData.get('advancePaid')?.toString() || '0', 10);
		const itemsJson = formData.get('items')?.toString() || '[]';

		if (!orderId) {
			return fail(400, { message: 'Order ID required' });
		}

		let parsedItems: any[] = [];
		try {
			parsedItems = JSON.parse(itemsJson);
		} catch {
			parsedItems = [];
		}
		const calculatedSubtotal = parsedItems.reduce(
			(acc: number, it: any) => acc + (Number(it.price) * Number(it.quantity) || 0),
			0
		);

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
					subtotal: calculatedSubtotal,
					discountAmount,
					deliveryCharge,
					advancePayment,
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
				return {
					success: true,
					trackingCode: result.trackingCode,
					consignmentId: result.consignmentId,
					trackingUrl: result.trackingUrl,
					courierName: result.courierName,
					message: result.message
				};
			} else {
				return fail(400, { message: result.error || 'বুকিং ব্যর্থ হয়েছে' });
			}
		} catch (err: any) {
			return fail(500, { message: err?.message || 'কুরিয়ার এন্ট্রিতে ত্রুটি' });
		}
	},

	resetCourierBooking: async ({ request, platform }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		try {
			const db = getDb(platform);
			await db
				.update(schema.orders)
				.set({
					trackingCode: null,
					consignmentId: null,
					courierProvider: null,
					courierStatus: null,
					status: 'confirmed',
					updatedAt: new Date()
				})
				.where(eq(schema.orders.id, orderId));

			await db.insert(schema.orderNotes).values({
				id: crypto.randomUUID(),
				orderId,
				adminName: 'Admin Staff',
				note: 'কুরিয়ার বুকিং বাতিল / রিসেট করা হয়েছে (আনবুকড)।',
				callStatus: 'customer_note'
			});

			return { success: true, message: 'কুরিয়ার বুকিং সফলভাবে রিসেট করা হয়েছে!' };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'রিসেট করতে ব্যর্থ হয়েছে' });
		}
	},

	addNote: async ({ request, platform, locals }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId')?.toString();
		const note = formData.get('note')?.toString()?.trim();
		const callStatus = formData.get('callStatus')?.toString()?.trim() || null;
		const adminName = locals.user?.name || 'Admin Staff';

		if (!orderId || !note) {
			return fail(400, { message: 'Order ID এবং Note আবশ্যক' });
		}

		try {
			const db = getDb(platform);
			const newId = crypto.randomUUID();
			const now = new Date();

			await db.insert(schema.orderNotes).values({
				id: newId,
				orderId,
				adminUserId: locals.user?.id || null,
				adminName,
				note,
				callStatus,
				createdAt: now
			});

			let updatedStatus: string | null = null;
			if (note.includes('কনফার্ম') || note.includes('রিসিভড')) {
				updatedStatus = 'confirmed';
			} else if (note.includes('ধরে নাই') || note.includes('বাজছে')) {
				updatedStatus = 'no_response';
			} else if (note.includes('ব্যস্ত') || note.includes('Busy')) {
				updatedStatus = 'busy';
			} else if (note.includes('বন্ধ')) {
				updatedStatus = 'no_response';
			}

			if (updatedStatus) {
				await db
					.update(schema.orders)
					.set({ status: updatedStatus, updatedAt: now })
					.where(eq(schema.orders.id, orderId));
			}

			return {
				success: true,
				note: {
					id: newId,
					note,
					author: adminName,
					time: now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
				},
				updatedStatus,
				message: 'নোট সফলভাবে ডাটাবেজে সংরক্ষণ করা হয়েছে!'
			};
		} catch (err: any) {
			console.error('Failed to add order note to D1:', err);
			return fail(500, { message: err?.message || 'Failed to save note' });
		}
	},

	deleteNote: async ({ request, platform }) => {
		const formData = await request.formData();
		const noteId = formData.get('noteId')?.toString();
		if (!noteId) return fail(400, { message: 'Note ID required' });

		try {
			const db = getDb(platform);
			await db.delete(schema.orderNotes).where(eq(schema.orderNotes.id, noteId));
			return { success: true, message: 'নোট মুছে ফেলা হয়েছে' };
		} catch (err: any) {
			console.error('Failed to delete note:', err);
			return fail(500, { message: err?.message || 'Failed to delete note' });
		}
	}
};
