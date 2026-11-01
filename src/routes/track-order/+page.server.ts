import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { OrderService } from '#lib/server/services/order.service';
import { fail } from '@sveltejs/kit';

const STATUS_LABELS: Record<string, string> = {
	pending: 'অপেক্ষমাণ (Pending)',
	processing: 'প্রসেসিং হচ্ছে (Processing)',
	confirmed: 'কনফার্ম করা হয়েছে (Confirmed)',
	shipped: 'কুরিয়ারে হস্তান্তর করা হয়েছে (Shipped)',
	delivered: 'সফলভাবে ডেলিভারি সম্পন্ন (Delivered)',
	cancelled: 'বাতিল করা হয়েছে (Cancelled)',
	returned: 'ফেরত এসেছে (Returned)'
};

export const load: PageServerLoad = async ({ url, locals }) => {
	return {
		user: locals.user ?? null,
		orderNumber: url.searchParams.get('order') || url.searchParams.get('orderId') || ''
	};
};

export const actions: Actions = {
	track: async ({ request, platform }) => {
		const data = await request.formData();
		const orderNumber = data.get('orderNumber')?.toString()?.trim() || '';
		const phone = data.get('phone')?.toString()?.trim() || '';

		if (!orderNumber || !phone) {
			return fail(400, { message: 'অর্ডার নম্বর এবং মোবাইল নম্বর দুটিই দিন।' });
		}

		try {
			const order = await OrderService.trackPublicOrder(getDb(platform), orderNumber, phone);
			if (!order) {
				return { notFound: true };
			}

			return {
				trackedOrder: {
					id: `#${(order.orderNumber || '').replace(/^#/, '')}`,
					date: new Date(order.createdAt).toLocaleDateString('bn-BD', {
						day: 'numeric',
						month: 'long',
						year: 'numeric'
					}),
					status: order.status,
					statusBangla: STATUS_LABELS[order.status] || order.status,
					courier: order.courierProvider,
					trackingCode: order.trackingCode,
					total: order.total,
					items: order.items
				}
			};
		} catch (err) {
			console.error('Track order query error:', err);
			return fail(500, { message: 'অর্ডার খুঁজতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' });
		}
	}
};
