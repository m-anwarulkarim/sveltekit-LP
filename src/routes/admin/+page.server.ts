import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { AnalyticsService } from '#lib/server/services/analytics.service';
import { OrderService } from '#lib/server/services/order.service';

export const load: PageServerLoad = async ({ platform }) => {
	let kpiSummary = null;
	let activeDailyTarget = null;
	let orders: Awaited<ReturnType<typeof OrderService.listDashboardOrders>> = [];

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			[kpiSummary, activeDailyTarget, orders] = await Promise.all([
				AnalyticsService.getKpiSummary(db),
				AnalyticsService.getActiveDailyTarget(db),
				OrderService.listDashboardOrders(db)
			]);
		} catch (e) {
			console.error('Failed to load admin analytics:', e);
		}
	}

	return {
		orders,
		kpiSummary,
		activeDailyTarget
	};
};
