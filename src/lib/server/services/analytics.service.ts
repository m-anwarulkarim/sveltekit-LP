import { eq, desc, sql, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface DashboardKpiSummary {
	totalOrders: number;
	totalRevenue: number;
	pendingOrders: number;
	confirmedOrders: number;
	deliveredOrders: number;
	cancelledOrders: number;
	returnedOrders: number;
	returnRatePercent: number;
	todayOrders: number;
	todayRevenue: number;
}

/**
 * Enterprise Business Analytics & KPI Reporting Service
 */
export class AnalyticsService {
	/**
	 * Computes Real-Time KPI Dashboard Summary
	 */
	static async getKpiSummary(db: DrizzleD1Database<typeof schema>): Promise<DashboardKpiSummary> {
		const DHAKA_UTC_OFFSET_MS = 6 * 60 * 60 * 1000;
		const DAY_MS = 24 * 60 * 60 * 1000;
		const startOfToday = Math.floor((Date.now() + DHAKA_UTC_OFFSET_MS) / DAY_MS) * DAY_MS - DHAKA_UTC_OFFSET_MS;

		const rows = await db
			.select({
				status: schema.orders.status,
				orderCount: sql<number>`count(*)`,
				revenue: sql<number>`coalesce(sum(${schema.orders.total}), 0)`,
				todayCount: sql<number>`sum(case when ${schema.orders.createdAt} >= ${startOfToday} then 1 else 0 end)`,
				todayRevenue: sql<number>`sum(case when ${schema.orders.createdAt} >= ${startOfToday} then ${schema.orders.total} else 0 end)`
			})
			.from(schema.orders)
			.where(eq(schema.orders.isTrashed, false))
			.groupBy(schema.orders.status)
			.all();

		let totalOrders = 0, totalRevenue = 0, todayOrders = 0, todayRevenue = 0;
		let pendingOrders = 0, confirmedOrders = 0, deliveredOrders = 0, cancelledOrders = 0, returnedOrders = 0;

		for (const row of rows) {
			const cnt = Number(row.orderCount) || 0;
			const rev = Number(row.revenue) || 0;
			totalOrders += cnt;
			todayOrders += Number(row.todayCount) || 0;

			if (row.status !== 'cancelled') {
				totalRevenue += rev;
				todayRevenue += Number(row.todayRevenue) || 0;
			}

			if (row.status === 'pending') pendingOrders = cnt;
			else if (row.status === 'confirmed' || row.status === 'processing') confirmedOrders += cnt;
			else if (row.status === 'delivered') deliveredOrders = cnt;
			else if (row.status === 'cancelled') cancelledOrders = cnt;
			else if (row.status === 'returned') returnedOrders = cnt;
		}

		const totalCount = totalOrders || 1;
		const returnRatePercent = Math.round(((returnedOrders + cancelledOrders) / totalCount) * 100);

		return {
			totalOrders, totalRevenue, pendingOrders, confirmedOrders,
			deliveredOrders, cancelledOrders, returnedOrders, returnRatePercent,
			todayOrders, todayRevenue
		};
	}

	/**
	 * Retrieves Active Daily Sales Target Progress
	 */
	static async getActiveDailyTarget(db: DrizzleD1Database<typeof schema>) {
		const target = await db
			.select()
			.from(schema.dailyTargets)
			.where(eq(schema.dailyTargets.status, 'active'))
			.orderBy(desc(schema.dailyTargets.createdAt))
			.get();

		if (!target) return null;

		const targetAmount = target.targetAmount || 1;
		const consumedAmount = target.consumedAmount || 0;
		const progressPercent = Math.min(100, Math.round((consumedAmount / targetAmount) * 100));

		return {
			...target,
			progressPercent,
			remainingAmount: Math.max(0, targetAmount - consumedAmount)
		};
	}
}

