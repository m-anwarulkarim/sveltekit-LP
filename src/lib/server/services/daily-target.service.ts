import { eq, desc, and, gte, lte, sql, notInArray } from 'drizzle-orm';
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
	aov: number;
}

export interface TargetViewItem {
	id: string;
	title: string;
	startDate: string;
	endDate: string;
	targetAmount: number;
	consumedAmount: number;
	ordersCount: number;
	aov: number;
	remainingAmount: number;
	percent: number;
	daysRemaining: number;
	dailyRequiredRate: number;
	status: 'active' | 'upcoming' | 'completed';
	createdAt?: Date | string | number | null;
}

/**
 * Enterprise Daily Target & Revenue Milestone Service
 */
export class DailyTargetService {
	private static isTableInitialized = false;

	/**
	 * Ensures daily_targets table exists in Cloudflare D1
	 */
	static async ensureTable(db: DrizzleD1Database<typeof schema>) {
		if (this.isTableInitialized) return;
		try {
			await db.run(
				sql.raw(`
				CREATE TABLE IF NOT EXISTS daily_targets (
					id TEXT PRIMARY KEY,
					title TEXT NOT NULL DEFAULT 'Daily Target',
					start_date TEXT NOT NULL,
					end_date TEXT NOT NULL,
					target_amount INTEGER NOT NULL,
					consumed_amount INTEGER NOT NULL DEFAULT 0,
					status TEXT NOT NULL DEFAULT 'active',
					created_at INTEGER NOT NULL,
					updated_at INTEGER NOT NULL
				);
			`)
			);
			this.isTableInitialized = true;
		} catch (e) {
			console.error('Failed to ensure daily_targets table:', e);
		}
	}

	/**
	 * Lists all daily targets with live consumed stats from real orders
	 */
	static async listTargets(db: DrizzleD1Database<typeof schema>): Promise<TargetViewItem[]> {
		await this.ensureTable(db);
		try {
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

			const todayStr = new Date().toISOString().split('T')[0];
			const todayMs = new Date().setHours(0, 0, 0, 0);

			// Calculate real progress for each target
			const targetsWithProgress: TargetViewItem[] = await Promise.all(
				rows.map(async (target) => {
					let consumed = 0;
					let ordersCount = 0;

					try {
						const startMs = new Date(target.startDate).setHours(0, 0, 0, 0);
						const endMs = new Date(target.endDate).setHours(23, 59, 59, 999);

						if (!isNaN(startMs) && !isNaN(endMs)) {
							// Filter out cancelled, returned, incomplete, and trashed orders
							const matchingOrders = await db
								.select({ total: schema.orders.total })
								.from(schema.orders)
								.where(
									and(
										eq(schema.orders.isTrashed, false),
										notInArray(schema.orders.status, ['cancelled', 'returned', 'incomplete']),
										gte(schema.orders.createdAt, new Date(startMs)),
										lte(schema.orders.createdAt, new Date(endMs))
									)
								)
								.all();

							if (matchingOrders.length > 0) {
								consumed = matchingOrders.reduce((sum, o) => sum + (o.total || 0), 0);
								ordersCount = matchingOrders.length;
							}
						}
					} catch (e) {
						console.error('Failed to query orders for target:', e);
						consumed = target.consumedAmount || 0;
					}

					// Dynamic status calculation
					let currentStatus: 'active' | 'upcoming' | 'completed' = 'active';
					if (target.startDate > todayStr) {
						currentStatus = 'upcoming';
					} else if (target.endDate < todayStr) {
						currentStatus = 'completed';
					} else {
						currentStatus = 'active';
					}

					const remainingAmount = Math.max(0, target.targetAmount - consumed);
					const percent =
						target.targetAmount > 0
							? Math.min(100, Math.round((consumed / target.targetAmount) * 100))
							: 0;
					const aov = ordersCount > 0 ? Math.round(consumed / ordersCount) : 0;

					// Days remaining calculation
					let daysRemaining = 0;
					let dailyRequiredRate = 0;
					if (currentStatus === 'active') {
						const endMs = new Date(target.endDate).setHours(23, 59, 59, 999);
						daysRemaining = Math.max(1, Math.ceil((endMs - todayMs) / (1000 * 60 * 60 * 24)));
						dailyRequiredRate = Math.ceil(remainingAmount / daysRemaining);
					}

					return {
						id: target.id,
						title: target.title,
						startDate: target.startDate,
						endDate: target.endDate,
						targetAmount: target.targetAmount,
						consumedAmount: consumed,
						ordersCount,
						aov,
						remainingAmount,
						percent,
						daysRemaining,
						dailyRequiredRate,
						status: currentStatus,
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
		await this.ensureTable(db);
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
		await this.ensureTable(db);
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
		await this.ensureTable(db);
		await db.delete(schema.dailyTargets).where(eq(schema.dailyTargets.id, id));
		return { id, success: true };
	}

	/**
	 * Computes day-by-day sales breakdown from real orders in 1 single fast query
	 */
	static async getDailyBreakdown(
		db: DrizzleD1Database<typeof schema>,
		startDateStr: string,
		endDateStr: string
	): Promise<DailyBreakdownItem[]> {
		await this.ensureTable(db);
		const result: DailyBreakdownItem[] = [];
		const start = new Date(startDateStr);
		const end = new Date(endDateStr);

		if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
			return result;
		}

		const startMs = new Date(start).setHours(0, 0, 0, 0);
		const endMs = new Date(end).setHours(23, 59, 59, 999);

		// Single query to fetch all valid orders in range
		let orders: { total: number | null; createdAt: Date | null }[] = [];
		try {
			orders = await db
				.select({
					total: schema.orders.total,
					createdAt: schema.orders.createdAt
				})
				.from(schema.orders)
				.where(
					and(
						eq(schema.orders.isTrashed, false),
						notInArray(schema.orders.status, ['cancelled', 'returned', 'incomplete']),
						gte(schema.orders.createdAt, new Date(startMs)),
						lte(schema.orders.createdAt, new Date(endMs))
					)
				)
				.all();
		} catch (e) {
			console.error('Failed to get orders for breakdown:', e);
		}

		// Group orders by date (YYYY-MM-DD)
		const dailyMap = new Map<string, { total: number; count: number }>();
		for (const ord of orders) {
			if (!ord.createdAt) continue;
			const dStr = new Date(ord.createdAt).toISOString().split('T')[0];
			const current = dailyMap.get(dStr) || { total: 0, count: 0 };
			current.total += ord.total || 0;
			current.count += 1;
			dailyMap.set(dStr, current);
		}

		// Generate calendar list for the range (up to 31 days)
		const maxDays = 31;
		let curr = new Date(start);
		let count = 0;

		while (curr <= end && count < maxDays) {
			const dateStr = curr.toISOString().split('T')[0];
			const dateFormatted = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			const stats = dailyMap.get(dateStr) || { total: 0, count: 0 };
			const aov = stats.count > 0 ? Math.round(stats.total / stats.count) : 0;

			result.push({
				date: dateStr,
				dayLabel: `Day ${count + 1} (${dateFormatted})`,
				salesAmount: stats.total,
				ordersCount: stats.count,
				aov
			});

			curr.setDate(curr.getDate() + 1);
			count++;
		}

		return result;
	}

	/**
	 * Seeds initial realistic targets if table is empty
	 */
	static async seedInitialTargets(db: DrizzleD1Database<typeof schema>) {
		const today = new Date();
		const pad = (n: number) => String(n).padStart(2, '0');
		const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

		const startCurrent = new Date(today);
		startCurrent.setDate(today.getDate() - 3);

		const endCurrent = new Date(today);
		endCurrent.setDate(today.getDate() + 7);

		const seeds = [
			{
				title: 'Mega Sales Target',
				startDate: formatDate(startCurrent),
				endDate: formatDate(endCurrent),
				targetAmount: 500000
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
					consumedAmount: 0,
					status: 'active',
					createdAt: new Date(),
					updatedAt: new Date()
				});
			} catch (e) {
				console.error(`Failed to seed target ${item.title}:`, e);
			}
		}
	}
}
