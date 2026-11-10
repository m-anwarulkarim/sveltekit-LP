import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { OrderService } from '#lib/server/services/order.service';

export const load: PageServerLoad = async ({ platform }) => {
	let orders: Awaited<ReturnType<typeof OrderService.listDashboardOrders>> = [];

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			orders = await OrderService.listDashboardOrders(db);
		} catch (e) {
			console.error('Failed to load admin analytics:', e);
		}
	}

	return { orders };
};
