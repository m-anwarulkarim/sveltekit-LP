import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import { NotificationService } from '#lib/server/services/notification.service';
import * as schema from '#lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ platform }) => {
	try {
		const db = getDb(platform);
		const unreadCount = await NotificationService.getUnreadCount(db);

		// Get the most recent notification to check if there is a fresh alert
		const latestRows = await db
			.select()
			.from(schema.notifications)
			.orderBy(desc(schema.notifications.createdAt))
			.limit(1)
			.all();

		const latest = latestRows[0]
			? {
					id: latestRows[0].id,
					title: latestRows[0].title,
					description: latestRows[0].description,
					category: latestRows[0].category,
					isRead: Boolean(latestRows[0].isRead),
					link: latestRows[0].link || '/admin/orders',
					createdAt: latestRows[0].createdAt
				}
			: null;

		return json({
			success: true,
			unreadCount,
			latest
		});
	} catch (error: any) {
		console.error('Error polling admin notifications:', error);
		return json({
			success: false,
			unreadCount: 0,
			latest: null
		});
	}
};

