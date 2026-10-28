import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { OrderService } from '#lib/server/services/order.service';

export const load: PageServerLoad = async (event) => {
	const orderId = event.url.searchParams.get('order_id') || `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
	let dbOrder = null;

	if (orderId) {
		try {
			const db = getDb(event.platform);
			dbOrder = await OrderService.getOrderById(db, orderId);
		} catch (e) {
			console.error('Failed to load order from database:', e);
		}
	}

	return {
		user: event.locals.user ?? null,
		orderId,
		dbOrder
	};
};
