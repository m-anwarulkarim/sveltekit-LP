import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, or, and, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, platform, locals }) => {
	const query = url.searchParams.get('order') || url.searchParams.get('q') || '';
	let trackedOrder: any = null;
	let notFound = false;

	if (query.trim()) {
		try {
			const db = getDb(platform);
			const clean = query.trim();
			const withoutHash = clean.replace(/^#/, '');

			// Search by ID, Order Number, or Customer Phone
			const orderRow = await db
				.select()
				.from(schema.orders)
				.where(
					and(
						or(
							eq(schema.orders.id, clean),
							eq(schema.orders.orderNumber, clean),
							eq(schema.orders.orderNumber, withoutHash),
							eq(schema.orders.customerPhone, clean)
						),
						eq(schema.orders.isTrashed, false)
					)
				)
				.orderBy(desc(schema.orders.createdAt))
				.limit(1)
				.get();

			if (orderRow) {
				const items = await db
					.select()
					.from(schema.orderItems)
					.where(eq(schema.orderItems.orderId, orderRow.id))
					.all();

				const statusBanglaMap: Record<string, string> = {
					pending: 'অপেক্ষমাণ (Pending)',
					processing: 'প্রসেসিং হচ্ছে (Processing)',
					confirmed: 'কনফার্ম করা হয়েছে (Confirmed)',
					shipped: 'কুরিয়ারে হস্তান্তর করা হয়েছে (Shipped)',
					delivered: 'সফলভাবে ডেলিভারি সম্পন্ন (Delivered)',
					cancelled: 'বাতিল করা হয়েছে (Cancelled)'
				};

				trackedOrder = {
					id: orderRow.orderNumber ? (orderRow.orderNumber.startsWith('#') ? orderRow.orderNumber : `#${orderRow.orderNumber}`) : `#${orderRow.id.slice(0, 8)}`,
					date: orderRow.createdAt ? new Date(orderRow.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : 'আজ',
					status: orderRow.status,
					statusBangla: statusBanglaMap[orderRow.status] || orderRow.status,
					customer: orderRow.customerName,
					phone: orderRow.customerPhone ? `${orderRow.customerPhone.slice(0, 5)}***${orderRow.customerPhone.slice(-3)}` : '',
					address: orderRow.shippingAddress,
					courier: orderRow.courierName || 'Steadfast Courier',
					trackingCode: orderRow.courierTrackingCode || 'অর্ডার প্রসেসিংয়ে রয়েছে',
					total: orderRow.totalAmount,
					subtotal: orderRow.subtotal,
					deliveryCharge: orderRow.deliveryCharge,
					paymentMethod: orderRow.paymentMethod,
					items: items.map((it) => ({
						name: it.productName,
						quantity: it.quantity,
						price: it.price,
						image: it.productImage
					}))
				};
			} else {
				notFound = true;
			}
		} catch (err) {
			console.error('Track order query error:', err);
		}
	}

	return {
		user: locals.user ?? null,
		searchQuery: query,
		trackedOrder,
		notFound
	};
};

export const actions: Actions = {
	track: async ({ request }) => {
		const data = await request.formData();
		const query = data.get('query')?.toString()?.trim();
		if (!query) {
			return fail(400, { message: 'অনুগ্রহ করে অর্ডার নম্বর বা মোবাইল নম্বর লিখুন।' });
		}
		return { success: true, redirectQuery: query };
	}
};

