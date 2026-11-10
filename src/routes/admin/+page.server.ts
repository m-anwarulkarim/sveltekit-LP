import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { OrderService } from '#lib/server/services/order.service';
import { VisitorAnalyticsService } from '#lib/server/services/visitor-analytics.service';

export const load: PageServerLoad = async ({ platform }) => {
	let orders: Awaited<ReturnType<typeof OrderService.listDashboardOrders>> = [];
	let trafficQuick = { activeNow: 0, todaySessions: 0 };

	try {
		const db = getDb(platform);
		const [ordersRes, trafficRes] = await Promise.allSettled([
			OrderService.listDashboardOrders(db),
			VisitorAnalyticsService.getTrafficSummary(db, 'today')
		]);

		if (ordersRes.status === 'fulfilled') orders = ordersRes.value;
		if (trafficRes.status === 'fulfilled') {
			trafficQuick = {
				activeNow: trafficRes.value.activeNow,
				todaySessions: trafficRes.value.todaySessions
			};
		}
	} catch (e) {
		console.error('Failed to load admin analytics:', e);
	}

	return { orders, trafficQuick };
};
