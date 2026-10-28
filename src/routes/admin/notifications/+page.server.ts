import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { NotificationService } from '#lib/server/services/notification.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let notificationsList: any[] = [];
	let unreadCount = 0;

	try {
		const db = getDb(platform);
		const [liveNotifications, liveUnread] = await Promise.all([
			NotificationService.listNotifications(db, { limit: 100 }),
			NotificationService.getUnreadCount(db)
		]);
		notificationsList = liveNotifications || [];
		unreadCount = liveUnread;
	} catch (error) {
		console.error('Failed to load notifications from D1:', error);
	}

	return {
		...parentData,
		notifications: notificationsList,
		unreadCount
	};
};

export const actions: Actions = {
	markAsRead: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { message: 'ID required' });

		try {
			const db = getDb(platform);
			await NotificationService.markAsRead(db, id);
			return { success: true, message: 'পঠিত হিসেবে চিহ্নিত করা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to mark notification as read:', e);
			return fail(500, { message: e.message });
		}
	},

	markAllAsRead: async ({ platform }) => {
		try {
			const db = getDb(platform);
			await NotificationService.markAllAsRead(db);
			return { success: true, message: 'সকল নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to mark all notifications as read:', e);
			return fail(500, { message: e.message });
		}
	},

	deleteNotification: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { message: 'ID required' });

		try {
			const db = getDb(platform);
			await NotificationService.deleteNotification(db, id);
			return { success: true, message: 'নোটিফিকেশন মুছে ফেলা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to delete notification:', e);
			return fail(500, { message: e.message });
		}
	},

	clearAll: async ({ platform }) => {
		try {
			const db = getDb(platform);
			await NotificationService.clearAll(db);
			return { success: true, message: 'সকল নোটিফিকেশন মুছে ফেলা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to clear notifications:', e);
			return fail(500, { message: e.message });
		}
	}
};

