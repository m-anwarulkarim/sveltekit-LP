import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { OrderService } from '#lib/server/services/order.service';
import { SettingsService } from '#lib/server/services/settings.service';

export const load: PageServerLoad = async (event) => {
	const orderId = event.url.searchParams.get('order_id') || `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
	let dbOrder = null;
	let orderSettings = null;

	try {
		const db = getDb(event.platform);
		if (orderId) {
			dbOrder = await OrderService.getOrderById(db, orderId);
		}
		orderSettings = await SettingsService.getOrderSettings(db);
	} catch (e) {
		console.error('Failed to load order or settings from database:', e);
	}

	return {
		user: event.locals.user ?? null,
		orderId,
		dbOrder,
		orderSettings
	};
};
