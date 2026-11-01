import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { BkashService } from '#lib/server/services/bkash.service';

const NOT_PAYABLE_STATUSES = new Set(['incomplete', 'cancelled', 'returned']);

export const POST: RequestHandler = async ({ request, url, platform }) => {
	try {
		const body = (await request.json()) as { orderId?: unknown };
		const orderId = typeof body?.orderId === 'string' ? body.orderId : '';

		if (!orderId) {
			return json({ success: false, message: 'অর্ডার আইডি প্রদান করা আবশ্যক' }, { status: 400 });
		}

		const db = getDb(platform);

		// The amount always comes from the saved order, never from the browser.
		const order = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
		if (!order || order.isTrashed || NOT_PAYABLE_STATUSES.has(order.status)) {
			return json({ success: false, message: 'অর্ডারটি পাওয়া যায়নি' }, { status: 404 });
		}
		if (order.paymentMethod !== 'bkash') {
			return json({ success: false, message: 'এই অর্ডারটি বিকাশ পেমেন্টের জন্য নয়' }, { status: 400 });
		}
		if (order.paymentStatus === 'paid') {
			return json({ success: false, message: 'এই অর্ডারের পেমেন্ট আগেই সম্পন্ন হয়েছে' }, { status: 409 });
		}

		const creds = await BkashService.getCredentials(db);
		if (!creds || !creds.appKey || !creds.appSecret || !creds.username || !creds.password) {
			return json(
				{ success: false, message: 'bKash গেটওয়ে এখনও অ্যাডমিন প্যানেল থেকে কনফিগার করা হয়নি' },
				{ status: 400 }
			);
		}

		const result = await BkashService.createPayment(creds, {
			amount: order.dueAmount || order.total,
			orderNumber: order.orderNumber || order.id,
			customerPhone: order.customerPhone || undefined,
			callbackUrl: `${url.origin}/api/payment/bkash/callback?orderId=${encodeURIComponent(order.id)}`
		});

		if (result.success && result.bkashURL) {
			return json({
				success: true,
				bkashURL: result.bkashURL,
				paymentID: result.paymentID
			});
		}

		return json(
			{
				success: false,
				message: result.message || 'বিকাশ পেমেন্ট লিংক তৈরি করতে ব্যর্থ হয়েছে'
			},
			{ status: 400 }
		);
	} catch (err: any) {
		console.error('Error in /api/payment/bkash/create:', err);
		return json({ success: false, message: 'সার্ভার অভ্যন্তরীণ সমস্যা' }, { status: 500 });
	}
};
