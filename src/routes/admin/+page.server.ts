import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { OrderService } from '#lib/server/services/order.service';
import { VisitorAnalyticsService } from '#lib/server/services/visitor-analytics.service';
import { CourierService } from '#lib/server/services/courier.service';

export const load: PageServerLoad = async ({ platform, url }) => {
	const rangeParam = url.searchParams.get('range') || 'today';
	const fromParam = url.searchParams.get('from');
	const toParam = url.searchParams.get('to');

	let orders: Awaited<ReturnType<typeof OrderService.listDashboardOrders>> = [];
	let trafficQuick = { activeNow: 0, todaySessions: 0 };
	let courierSummary = {
		dispatchedToday: 0,
		inTransitCount: 0,
		deliveredCount: 0,
		liveBalance: 0,
		netPayableTotal: 0,
		liveBalanceProvider: 'Steadfast'
	};

	try {
		const db = getDb(platform);
		const [ordersRes, trafficRes, courierRes] = await Promise.allSettled([
			OrderService.listDashboardOrders(db),
			VisitorAnalyticsService.getTrafficSummary(db, {
				range: rangeParam as any,
				from: fromParam,
				to: toParam
			}),
			CourierService.getCourierHubData(db, { dateRange: rangeParam as any })
		]);

		if (ordersRes.status === 'fulfilled') orders = ordersRes.value;
		if (trafficRes.status === 'fulfilled') {
			trafficQuick = {
				activeNow: trafficRes.value.activeNow,
				todaySessions: trafficRes.value.todaySessions
			};
		}
		if (courierRes.status === 'fulfilled') {
			const kpis = courierRes.value.kpis;
			courierSummary = {
				dispatchedToday: kpis.dispatchedToday,
				inTransitCount: kpis.inTransitCount,
				deliveredCount: kpis.deliveredCount,
				liveBalance: kpis.liveBalance,
				netPayableTotal: kpis.netPayableTotal,
				liveBalanceProvider: kpis.liveBalanceProvider
			};
		}
	} catch (e) {
		console.error('Failed to load admin analytics:', e);
	}

	return {
		orders,
		trafficQuick,
		courierSummary,
		activeRange: rangeParam,
		activeFrom: fromParam || null,
		activeTo: toParam || null
	};
};
