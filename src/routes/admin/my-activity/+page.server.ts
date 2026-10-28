import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	const allOrders: any[] = parentData?.orders || [];

	let myOrders: any[] = [];
	let recentNotes: any[] = [];
	let recentAuditLogs: any[] = [];

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);

			// 1. Fetch recent order call notes
			recentNotes = await db
				.select()
				.from(schema.orderNotes)
				.orderBy(desc(schema.orderNotes.createdAt))
				.limit(20)
				.all();

			// 2. Fetch admin audit logs
			recentAuditLogs = await db
				.select()
				.from(schema.auditLogs)
				.orderBy(desc(schema.auditLogs.createdAt))
				.limit(20)
				.all();

			// 3. Map orders processed by staff / admin
			const processedOrders = await db
				.select()
				.from(schema.orders)
				.where(eq(schema.orders.isTrashed, false))
				.orderBy(desc(schema.orders.updatedAt))
				.limit(30)
				.all();

			myOrders = processedOrders.map((o) => {
				let firstItemName = 'Standard Product';
				try {
					const parsed = JSON.parse(o.items || '[]');
					if (parsed.length > 0) {
						firstItemName = parsed[0].name || parsed[0].productName || 'Standard Product';
					}
				} catch {
					// fallback
				}

				return {
					id: o.orderNumber || o.id,
					customerName: o.customerName,
					phone: o.customerPhone || o.customerEmail,
					status: o.status,
					amount: o.total,
					createdAt: o.createdAt
						? new Date(o.createdAt).toLocaleString('en-US', {
								dateStyle: 'medium',
								timeStyle: 'short'
							})
						: 'Today',
					items: firstItemName,
					callStatus: o.status === 'confirmed' || o.status === 'delivered' ? 'Call Completed' : 'Pending Action'
				};
			});
		} catch (e) {
			console.error('Failed to query admin activity from D1:', e);
		}
	}

	// Dynamic 14-day telemetry calculation
	const now = new Date();
	const dynamicDays = [];
	for (let i = 13; i >= 0; i--) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		const dateLabel = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

		// Count orders on this day
		const count = allOrders.filter((o: any) => {
			if (!o.createdAt) return false;
			const orderDate = new Date(o.createdAt);
			return (
				orderDate.getDate() === d.getDate() &&
				orderDate.getMonth() === d.getMonth() &&
				orderDate.getFullYear() === d.getFullYear()
			);
		}).length;

		dynamicDays.push({ date: dateLabel, count });
	}

	// Performance Stats
	const totalProcessed = myOrders.length || allOrders.length || 0;
	const confirmedProcessed = (myOrders.length > 0 ? myOrders : allOrders).filter((o: any) =>
		['confirmed', 'processing', 'shipped', 'delivered'].includes(o.status)
	).length;
	const successRate = totalProcessed > 0 ? Math.round((confirmedProcessed / totalProcessed) * 100) : 0;
	const totalRevenue = (myOrders.length > 0 ? myOrders : allOrders).reduce(
		(sum: number, o: any) => sum + (o.amount || o.total || 0),
		0
	);

	return {
		...parentData,
		myOrders,
		recentNotes,
		recentAuditLogs,
		activityDays: dynamicDays,
		activityStats: {
			totalProcessed,
			confirmedProcessed,
			successRate,
			totalRevenue
		}
	};
};

export const actions: Actions = {
	refreshTelemetry: async () => {
		return { success: true, timestamp: Date.now() };
	}
};
