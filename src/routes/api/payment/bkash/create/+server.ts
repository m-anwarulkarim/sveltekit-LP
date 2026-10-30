import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import { BkashService } from '#lib/server/services/bkash.service';

export const POST: RequestHandler = async ({ request, url, platform }) => {
	try {
		const body = await request.json();
		const { orderId, orderNumber, amount, customerPhone } = body;

		if (!orderId || !orderNumber || !amount) {
			return json(
				{ success: false, message: 'অর্ডার আইডি ও টাকার পরিমাণ প্রদান করা আবশ্যক' },
				{ status: 400 }
			);
		}

		const db = getDb(platform);
		const creds = await BkashService.getCredentials(db);

		if (!creds || !creds.appKey || !creds.appSecret || !creds.username || !creds.password) {
			return json(
				{ success: false, message: 'bKash গেটওয়ে এখনও অ্যাডমিন প্যানেল থেকে কনফিগার করা হয়নি' },
				{ status: 400 }
			);
		}

		const origin = url.origin;
		const callbackUrl = `${origin}/api/payment/bkash/callback?orderId=${encodeURIComponent(orderId)}`;

		const result = await BkashService.createPayment(creds, {
			amount: Number(amount),
			orderNumber: String(orderNumber),
			customerPhone: customerPhone ? String(customerPhone) : undefined,
			callbackUrl
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
		return json(
			{ success: false, message: err?.message || 'সার্ভার অভ্যন্তরীণ সমস্যা' },
			{ status: 500 }
		);
	}
};

