import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import { CartService } from '#lib/server/services/cart.service';

const MAX_CART_LINES = 50;
const MAX_CART_BYTES = 100_000;

export const GET: RequestHandler = async ({ locals, platform }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return json({ success: false, reason: 'guest', cart: null });
	}

	try {
		const db = getDb(platform);
		const cart = await CartService.getUserCart(db, userId);
		return json({ success: true, cart });
	} catch (e: any) {
		console.error('Failed to get user cart:', e);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return json({ success: false, reason: 'guest' });
	}

	try {
		const body: any = await request.json();
		const items = Array.isArray(body?.items) ? body.items.slice(0, MAX_CART_LINES) : [];
		if (JSON.stringify(items).length > MAX_CART_BYTES) {
			return json({ success: false, error: 'Cart too large' }, { status: 413 });
		}
		const couponCode = typeof body?.couponCode === 'string' ? body.couponCode.slice(0, 50) : '';
		const discountPercent = Math.min(100, Math.max(0, Number(body?.discountPercent) || 0));

		const db = getDb(platform);
		await CartService.saveUserCart(db, userId, {
			items,
			couponCode,
			discountPercent
		});

		return json({ success: true });
	} catch (e: any) {
		console.error('Failed to save user cart:', e);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ locals, platform }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return json({ success: true });
	}

	try {
		const db = getDb(platform);
		await CartService.clearUserCart(db, userId);
		return json({ success: true });
	} catch (e: any) {
		console.error('Failed to clear user cart:', e);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

