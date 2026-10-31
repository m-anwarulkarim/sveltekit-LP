import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { ReportService } from '#lib/server/services/report.service';

export const load: PageServerLoad = async ({ url, platform }) => {
	const todayStr = new Date().toISOString().split('T')[0];
	const startDate = url.searchParams.get('startDate') || todayStr;
	const endDate = url.searchParams.get('endDate') || todayStr;

	try {
		const db = getDb(platform);
		const summary = await ReportService.getDailyBusinessSummaryReport(db, {
			startDate,
			endDate
		});
		return { summary };
	} catch (error) {
		console.error('Failed to load daily business summary report:', error);
		return {
			summary: {
				startDate,
				endDate,
				totalOrdersReceived: 0,
				totalOrdersDelivered: 0,
				totalOrdersPending: 0,
				totalOrdersCancelled: 0,
				returnOrders: 0,
				totalOrderValue: 0,
				advanceCollected: 0,
				dueAmount: 0,
				deliveryCharge: 0,
				courierCost: 0,
				packagingCost: 0,
				netEstimatedProfit: 0,
				orders: []
			}
		};
	}
};
