import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface CreateTargetPayload {
	title?: string;
	startDate: string;
	endDate: string;
	targetAmount: number;
}

export interface UpdateTargetPayload {
	title?: string;
	startDate?: string;
	endDate?: string;
	targetAmount?: number;
	status?: 'active' | 'upcoming' | 'completed';
}

export interface DailyBreakdownItem {
	date: string;
	dayLabel: string;
	salesAmount: number;
	ordersCount: number;
}

/**
 * Enterprise Daily Target & Revenue Milestone Service
 */
export class DailyTargetService {
	/**
	 * Lists all daily targets with live consumed stats
	 */
	static async listTargets(db: DrizzleD1Database<typeof schema>) {
		try {
			// Auto-seed if empty
			const countRes = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.dailyTargets)
				.all();
			const totalInDb = countRes[0]?.count ?? 0;

			if (totalInDb === 0) {
				await this.seedInitialTargets(db);
			}

			const rows = await db
				.select()
				.from(schema.dailyTargets)
				.orderBy(desc(schema.dailyTargets.createdAt))
				.all();

			// Auto calculate consumed amount from orders if possible
			const targetsWithProgress = await Promise.all(
				rows.map(async (target) => {
					let consumed = target.consumedAmount || 0;

					try {
						const startMs = new Date(target.startDate).setHours(0, 0, 0, 0);
						const endMs = new Date(target.endDate).setHours(23, 59, 59, 999);

						if (!isNaN(startMs) && !isNaN(endMs)) {
							const matchingOrders = await db
								.select({ total: schema.orders.total })
								.from(schema.orders)
								.where(
									and(
										eq(schema.orders.isTrashed, false),
										gte(schema.orders.createdAt, new Date(startMs)),
										lte(schema.orders.createdAt, new Date(endMs))
									)
								)
								.all();

							if (matchingOrders.length > 0) {
								const calculated = matchingOrders.reduce((sum, o) => sum + (o.total || 0), 0);
								if (calculated > 0) {
									consumed = calculated;
								}
							}
						}
					} catch {
						// Keep current consumed if order query fails
					}

					// Dynamic status calculation
					const today = new Date().toISOString().split('T')[0];
					let currentStatus = target.status;
					if (target.startDate > today) {
						currentStatus = 'upcoming';
					} else if (target.endDate < today) {
						currentStatus = 'completed';
					} else {
						currentStatus = 'active';
					}

					return {
						id: target.id,
						title: target.title,
						startDate: target.startDate,
						endDate: target.endDate,
						targetAmount: target.targetAmount,
						consumedAmount: consumed,
						status: currentStatus as 'active' | 'upcoming' | 'completed',
						createdAt: target.createdAt
					};
				})
			);

			return targetsWithProgress;
		} catch (error) {
			console.error('Error in DailyTargetService.listTargets:', error);
			return [];
		}
	}

	/**
	 * Creates a new daily target
	 */
	static async createTarget(db: DrizzleD1Database<typeof schema>, payload: CreateTargetPayload) {
		const today = new Date().toISOString().split('T')[0];
		let status: 'active' | 'upcoming' | 'completed' = 'active';

		if (payload.startDate > today) {
			status = 'upcoming';
		} else if (payload.endDate < today) {
			status = 'completed';
		}

		const newTarget: typeof schema.dailyTargets.$inferInsert = {
			id: crypto.randomUUID(),
			title: payload.title?.trim() || 'Daily Sales Target',
			startDate: payload.startDate,
			endDate: payload.endDate,
			targetAmount: Math.round(payload.targetAmount),
			consumedAmount: 0,
			status,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.insert(schema.dailyTargets).values(newTarget);
		return newTarget;
	}

	/**
	 * Updates an existing daily target
	 */
	static async updateTarget(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		payload: UpdateTargetPayload
	) {
		const updateData: Partial<typeof schema.dailyTargets.$inferInsert> = {
			updatedAt: new Date()
		};

		if (payload.title !== undefined) updateData.title = payload.title.trim();
		if (payload.startDate !== undefined) updateData.startDate = payload.startDate;
		if (payload.endDate !== undefined) updateData.endDate = payload.endDate;
		if (payload.targetAmount !== undefined) updateData.targetAmount = Math.round(payload.targetAmount);
		if (payload.status !== undefined) updateData.status = payload.status;

		await db
			.update(schema.dailyTargets)
			.set(updateData)
			.where(eq(schema.dailyTargets.id, id));

		return { id, success: true };
	}

	/**
	 * Deletes a target by id
	 */
	static async deleteTarget(db: DrizzleD1Database<typeof schema>, id: string) {
		await db.delete(schema.dailyTargets).where(eq(schema.dailyTargets.id, id));
		return { id, success: true };
	}

	/**
	 * Computes day-by-day sales breakdown for a target
	 */
	static async getDailyBreakdown(
		db: DrizzleD1Database<typeof schema>,
		startDateStr: string,
		endDateStr: string
	): Promise<DailyBreakdownItem[]> {
		const result: DailyBreakdownItem[] = [];
		const start = new Date(startDateStr);
		const end = new Date(endDateStr);

		if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
			return result;
		}

		// Cap max days to 30 to avoid excessive loops
		const maxDays = 30;
		let current = new Date(start);
		let count = 0;

		while (current <= end && count < maxDays) {
			const dateStr = current.toISOString().split('T')[0];
			const dayStartMs = new Date(current).setHours(0, 0, 0, 0);
			const dayEndMs = new Date(current).setHours(23, 59, 59, 999);

			let daySales = 0;
			let ordersCount = 0;

			try {
				const orders = await db
					.select({ total: schema.orders.total })
					.from(schema.orders)
					.where(
						and(
							eq(schema.orders.isTrashed, false),
							gte(schema.orders.createdAt, new Date(dayStartMs)),
							lte(schema.orders.createdAt, new Date(dayEndMs))
						)
					)
					.all();

				daySales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
				ordersCount = orders.length;
			} catch {
				// Fallback to 0 if db fails
			}

			result.push({
				date: dateStr,
				dayLabel: `Day ${count + 1} (${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
				salesAmount: daySales,
				ordersCount
			});

			current.setDate(current.getDate() + 1);
			count++;
		}

		return result;
	}

	/**
	 * Seeds initial realistic targets
	 */
	static async seedInitialTargets(db: DrizzleD1Database<typeof schema>) {
		const seeds = [
			{
				title: 'Mega Flash Sale Target',
				startDate: '2026-10-24',
				endDate: '2026-10-31',
				targetAmount: 1500000,
				consumedAmount: 485200,
				status: 'active'
			},
			{
				title: 'Eid Mega Campaign Target',
				startDate: '2026-10-15',
				endDate: '2026-10-23',
				targetAmount: 2500000,
				consumedAmount: 2150000,
				status: 'completed'
			},
			{
				title: 'Winter Season Launch Goal',
				startDate: '2026-11-01',
				endDate: '2026-11-15',
				targetAmount: 3000000,
				consumedAmount: 0,
				status: 'upcoming'
			}
		];

		for (const item of seeds) {
			try {
				await db.insert(schema.dailyTargets).values({
					id: crypto.randomUUID(),
					title: item.title,
					startDate: item.startDate,
					endDate: item.endDate,
					targetAmount: item.targetAmount,
					consumedAmount: item.consumedAmount,
					status: item.status,
					createdAt: new Date(),
					updatedAt: new Date()
				});
			} catch (e) {
				console.error(`Failed to seed target ${item.title}:`, e);
			}
		}
	}
}
