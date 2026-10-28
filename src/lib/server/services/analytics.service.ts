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
		const allOrders = await db
			.select({
				id: schema.orders.id,
				total: schema.orders.total,
				status: schema.orders.status,
				createdAt: schema.orders.createdAt
			})
			.from(schema.orders)
			.where(eq(schema.orders.isTrashed, false))
			.all();

		const startOfTodayMs = new Date().setHours(0, 0, 0, 0);

		let totalRevenue = 0;
		let todayOrders = 0;
		let todayRevenue = 0;
		let pendingOrders = 0;
		let confirmedOrders = 0;
		let deliveredOrders = 0;
		let cancelledOrders = 0;
		let returnedOrders = 0;

		for (const order of allOrders) {
			const orderTotal = order.total || 0;
			const createdMs = order.createdAt ? new Date(order.createdAt).getTime() : 0;

			if (order.status !== 'cancelled') {
				totalRevenue += orderTotal;
			}

			if (createdMs >= startOfTodayMs) {
				todayOrders += 1;
				if (order.status !== 'cancelled') {
					todayRevenue += orderTotal;
				}
			}

			if (order.status === 'pending') pendingOrders += 1;
			else if (order.status === 'confirmed' || order.status === 'processing') confirmedOrders += 1;
			else if (order.status === 'delivered') deliveredOrders += 1;
			else if (order.status === 'cancelled') cancelledOrders += 1;
			else if (order.status === 'returned') returnedOrders += 1;
		}

		const totalCount = allOrders.length || 1;
		const returnRatePercent = Math.round(((returnedOrders + cancelledOrders) / totalCount) * 100);

		return {
			totalOrders: allOrders.length,
			totalRevenue,
			pendingOrders,
			confirmedOrders,
			deliveredOrders,
			cancelledOrders,
			returnedOrders,
			returnRatePercent,
			todayOrders,
			todayRevenue
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

