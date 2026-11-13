import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { BkashService, type BkashCredentials } from '#lib/server/services/bkash.service';
import { getAuthSecret } from '#lib/server/secrets';
import { timingSafeEqual } from '#lib/server/utils/password';

function checkoutError(code: string, orderId: string, message?: string): string {
	const params = new URLSearchParams({ error: code, orderId });
	if (message) params.set('message', message);
	return `/checkout?${params}`;
}

function thankYou(orderId: string, trxID?: string): string {
	const params = new URLSearchParams({ order_id: orderId, payment: 'bkash_success' });
	if (trxID) params.set('trxID', trxID);
	return `/thank-you?${params}`;
}

/**
 * Asks bKash for the real outcome. If execute did not confirm (a retry, or a dropped
 * connection after the customer already paid), the query API has the final answer.
 */
async function resolvePayment(creds: BkashCredentials, paymentID: string) {
	const executed = await BkashService.executePayment(creds, paymentID);
	if (executed.success && executed.trxID) {
		return {
			trxID: executed.trxID,
			amount: Number(executed.amount),
			invoice: executed.raw?.merchantInvoiceNumber as string | undefined
		};
	}

	const queried = await BkashService.queryPayment(creds, paymentID);
	if (queried?.transactionStatus === 'Completed' && queried?.trxID) {
		return {
			trxID: queried.trxID as string,
			amount: Number(queried.amount),
			invoice: queried.merchantInvoiceNumber as string | undefined
		};
	}

	return { failureMessage: executed.message };
}

async function verifyCallbackSig(orderId: string, sig: string | null): Promise<boolean> {
	if (!sig) return false;
	const secret = getAuthSecret();
	if (!secret) return false;
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(`bkash-callback:${secret}`),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const expected = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(orderId));
	const expectedStr = btoa(String.fromCharCode(...new Uint8Array(expected)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
	return timingSafeEqual(sig, expectedStr);
}

export const GET: RequestHandler = async ({ url, platform }) => {
	const paymentID = url.searchParams.get('paymentID');
	const status = url.searchParams.get('status');
	const orderId = url.searchParams.get('orderId');
	const sig = url.searchParams.get('sig');

	if (!orderId) {
		throw redirect(303, '/checkout?error=missing_order');
	}

	// If a callback signature was provided, verify it was initiated by our server
	if (sig && !(await verifyCallbackSig(orderId, sig))) {
		console.error(`bKash callback signature mismatch for order ${orderId}`);
		throw redirect(303, checkoutError('bkash_failed', orderId));
	}

	// Customer cancelled or payment failed at bKash gateway
	if (status !== 'success' || !paymentID) {
		throw redirect(303, checkoutError(`bkash_${status === 'cancel' ? 'cancel' : 'failed'}`, orderId));
	}

	let target: string;
	try {
		const db = getDb(platform);
		const order = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();

		if (!order) {
			target = checkoutError('bkash_failed', orderId);
		} else if (order.paymentStatus === 'paid') {
			// A repeated or forged callback must not change a settled order.
			target = thankYou(orderId);
		} else {
			const creds = await BkashService.getCredentials(db);
			if (!creds) {
				target = checkoutError('bkash_unconfigured', orderId);
			} else {
				target = await settleOrder(db, order, creds, paymentID);
			}
		}
	} catch (err) {
		console.error('CRITICAL: bKash callback error:', err);
		target = checkoutError('bkash_server_error', orderId);
	}

	throw redirect(303, target);
};

async function settleOrder(
	db: ReturnType<typeof getDb>,
	order: typeof schema.orders.$inferSelect,
	creds: BkashCredentials,
	paymentID: string
): Promise<string> {
	const result = await resolvePayment(creds, paymentID);

	// This URL is public, so a failed attempt never changes the order's stored status.
	if (!('trxID' in result) || !result.trxID) {
		console.error(`bKash payment not completed for order ${order.id}: ${result.failureMessage}`);
		return checkoutError('bkash_declined', order.id, result.failureMessage);
	}

	const expectedAmount = order.dueAmount || order.total;
	const invoiceMatches = !result.invoice || result.invoice === (order.orderNumber || order.id);
	const amountMatches = result.amount >= expectedAmount;
	const noteBase = `bKash TrxID: ${result.trxID} | PaymentID: ${paymentID} | Amount: ${result.amount}`;

	if (!invoiceMatches || !amountMatches) {
		// Money moved but not for this order: keep it unpaid and flag it for a human.
		await db.insert(schema.orderNotes).values({
			id: crypto.randomUUID(),
			orderId: order.id,
			adminName: 'bKash Gateway',
			note: `পেমেন্ট মেলেনি, যাচাই করুন। প্রত্যাশিত ৳${expectedAmount}। ${noteBase}`,
			callStatus: 'customer_note'
		});
		return checkoutError('bkash_declined', order.id, 'পেমেন্টের পরিমাণ অর্ডারের সাথে মেলেনি।');
	}

	await db.batch([
		db
			.update(schema.orders)
			.set({
				paymentMethod: 'bkash',
				paymentStatus: 'paid',
				advancePayment: result.amount,
				dueAmount: Math.max(0, order.total - result.amount),
				updatedAt: new Date()
			})
			.where(eq(schema.orders.id, order.id)),
		db.insert(schema.orderNotes).values({
			id: crypto.randomUUID(),
			orderId: order.id,
			adminName: 'bKash Gateway',
			note: noteBase,
			callStatus: 'customer_note'
		})
	]);

	return thankYou(order.id, result.trxID);
}
