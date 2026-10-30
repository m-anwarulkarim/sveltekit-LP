import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { BkashService } from '#lib/server/services/bkash.service';

export const GET: RequestHandler = async ({ url, platform }) => {
	const paymentID = url.searchParams.get('paymentID');
	const status = url.searchParams.get('status');
	const orderId = url.searchParams.get('orderId');

	if (!orderId) {
		throw redirect(303, '/checkout?error=missing_order');
	}

	// Customer cancelled or payment failed at bKash gateway
	if (status === 'cancel' || status === 'failure' || !paymentID) {
		throw redirect(303, `/checkout?error=bkash_${status || 'failed'}&orderId=${encodeURIComponent(orderId)}`);
	}

	try {
		const db = getDb(platform);
		const creds = await BkashService.getCredentials(db);

		if (!creds) {
			throw redirect(303, `/checkout?error=bkash_unconfigured&orderId=${encodeURIComponent(orderId)}`);
		}

		// Execute payment with bKash server
		const executeResult = await BkashService.executePayment(creds, paymentID);

		if (executeResult.success && executeResult.trxID) {
			// Settle order in database: Mark payment as paid
			await db
				.update(schema.orders)
				.set({
					paymentMethod: 'bkash',
					paymentStatus: 'paid',
					adminNotes: `bKash TrxID: ${executeResult.trxID} | PaymentID: ${paymentID} | Amount: ${executeResult.amount || 'N/A'}`,
					updatedAt: new Date()
				})
				.where(eq(schema.orders.id, orderId));

			// Clean redirect to thank-you page with transaction confirmation
			throw redirect(
				303,
				`/thank-you?orderId=${encodeURIComponent(orderId)}&payment=bkash_success&trxID=${encodeURIComponent(executeResult.trxID)}`
			);
		} else {
			// Execute failed
			await db
				.update(schema.orders)
				.set({
					paymentStatus: 'failed',
					adminNotes: `bKash Execute Failed: ${executeResult.message} (${executeResult.statusCode || 'N/A'})`,
					updatedAt: new Date()
				})
				.where(eq(schema.orders.id, orderId));

			throw redirect(
				303,
				`/checkout?error=bkash_declined&message=${encodeURIComponent(executeResult.message)}&orderId=${encodeURIComponent(orderId)}`
			);
		}
	} catch (err: any) {
		// If err is a SvelteKit redirect, rethrow it
		if (err?.status && err?.location) throw err;

		console.error('CRITICAL: bKash callback error:', err);
		throw redirect(303, `/checkout?error=bkash_server_error&orderId=${encodeURIComponent(orderId)}`);
	}
};

