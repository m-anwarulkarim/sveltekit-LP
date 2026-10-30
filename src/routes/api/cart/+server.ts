import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import { CartService } from '#lib/server/services/cart.service';

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
		return json({ success: false, error: e?.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return json({ success: false, reason: 'guest' });
	}

	try {
		const body = await request.json();
		const items = Array.isArray(body.items) ? body.items : [];
		const couponCode = typeof body.couponCode === 'string' ? body.couponCode : '';
		const discountPercent = Number(body.discountPercent) || 0;

		const db = getDb(platform);
		await CartService.saveUserCart(db, userId, {
			items,
			couponCode,
			discountPercent
		});

		return json({ success: true });
	} catch (e: any) {
		console.error('Failed to save user cart:', e);
		return json({ success: false, error: e?.message }, { status: 500 });
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
		return json({ success: false, error: e?.message }, { status: 500 });
	}
};

