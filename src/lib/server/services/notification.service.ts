import { eq, desc, and, sql, inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface NotificationFilterOptions {
	category?: 'all' | 'unread' | 'order' | 'courier' | 'system';
	search?: string;
	limit?: number;
	offset?: number;
}

export interface CreateNotificationInput {
	title: string;
	description: string;
	category?: 'order' | 'courier' | 'system';
	link?: string;
}

export class NotificationService {
	/**
	 * Lists notifications from Cloudflare D1 with filtering and search
	 */
	static async listNotifications(
		db: DrizzleD1Database<typeof schema>,
		options: NotificationFilterOptions = {}
	) {
		try {
			const conditions: any[] = [];

			if (options.category && options.category !== 'all') {
				if (options.category === 'unread') {
					conditions.push(eq(schema.notifications.isRead, false));
				} else {
					conditions.push(eq(schema.notifications.category, options.category));
				}
			}

			let query = db.select().from(schema.notifications);

			if (conditions.length > 0) {
				query = query.where(and(...conditions)) as any;
			}

			query = query.orderBy(desc(schema.notifications.createdAt)) as any;

			if (options.limit) {
				query = query.limit(options.limit) as any;
			}
			if (options.offset) {
				query = query.offset(options.offset) as any;
			}

			const rows = await query.all();

			return rows.map((n) => ({
				id: n.id,
				title: n.title,
				description: n.description,
				category: n.category as 'order' | 'courier' | 'system',
				isRead: Boolean(n.isRead),
				link: n.link || '/admin/orders',
				createdAt: n.createdAt
			}));
		} catch (error) {
			console.error('Error in NotificationService.listNotifications:', error);
			return [];
		}
	}

	/**
	 * Gets total count of unread notifications for live Navbar badge
	 */
	static async getUnreadCount(db: DrizzleD1Database<typeof schema>): Promise<number> {
		try {
			const res = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.notifications)
				.where(eq(schema.notifications.isRead, false))
				.all();
			return res[0]?.count ?? 0;
		} catch (error) {
			console.error('Error in NotificationService.getUnreadCount:', error);
			return 0;
		}
	}

	/**
	 * Creates a new notification in D1
	 */
	static async createNotification(
		db: DrizzleD1Database<typeof schema>,
		input: CreateNotificationInput
	) {
		const id = crypto.randomUUID();
		try {
			await db.insert(schema.notifications).values({
				id,
				title: input.title.trim(),
				description: input.description.trim(),
				category: input.category || 'order',
				isRead: false,
				link: input.link || '/admin/orders'
			});
			return { id, success: true };
		} catch (error) {
			console.error('Error in NotificationService.createNotification:', error);
			return { id, success: false };
		}
	}

	/**
	 * Marks an individual notification as read
	 */
	static async markAsRead(db: DrizzleD1Database<typeof schema>, id: string) {
		try {
			await db
				.update(schema.notifications)
				.set({ isRead: true })
				.where(eq(schema.notifications.id, id));
			return { success: true };
		} catch (error) {
			console.error('Error marking notification as read:', error);
			return { success: false };
		}
	}

	/**
	 * Marks all unread notifications as read
	 */
	static async markAllAsRead(db: DrizzleD1Database<typeof schema>) {
		try {
			await db
				.update(schema.notifications)
				.set({ isRead: true })
				.where(eq(schema.notifications.isRead, false));
			return { success: true };
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
			return { success: false };
		}
	}

	/**
	 * Deletes an individual notification
	 */
	static async deleteNotification(db: DrizzleD1Database<typeof schema>, id: string) {
		try {
			await db.delete(schema.notifications).where(eq(schema.notifications.id, id));
			return { success: true };
		} catch (error) {
			console.error('Error deleting notification:', error);
			return { success: false };
		}
	}

	/**
	 * Clears all notifications
	 */
	static async clearAll(db: DrizzleD1Database<typeof schema>) {
		try {
			await db.delete(schema.notifications);
			return { success: true };
		} catch (error) {
			console.error('Error clearing all notifications:', error);
			return { success: false };
		}
	}

	/**
	 * Seeds initial realistic notifications if table is empty
	 */
	static async seedInitialNotifications(db: DrizzleD1Database<typeof schema>) {
		const initialList: CreateNotificationInput[] = [
			{
				title: 'নতুন ওয়েবসাইট অর্ডার প্রাপ্ত হয়েছে',
				description: 'কাস্টমার সাইদুর রহমান ২ টি আইটেম অর্ডার করেছেন। মোট বিল: ৳৩,৯৫০ (ক্যাশ অন ডেলিভারি)।',
				category: 'order',
				link: '/admin/orders'
			},
			{
				title: 'Steadfast কুরিয়ার পার্সেল ডেলিভারি সম্পন্ন',
				description: 'ট্র্যাকিং নম্বর CID-884920 সফলভাবে ডেলিভারি হয়েছে। টাকা অ্যাকাউন্টে জমা হয়েছে।',
				category: 'courier',
				link: '/admin/orders/list'
			},
			{
				title: 'স্টক অ্যালার্ট: AURA Spectrum X অবশিষ্ট মাত্র ৪ টি',
				description: 'ইনভেন্টরিতে স্টক কমে এসেছে। দ্রুত নতুন ব্যাচ রি-স্টক করার পরামর্শ দেওয়া হচ্ছে।',
				category: 'system',
				link: '/admin/products'
			},
			{
				title: 'অ্যাডমিন সিকিউরিটি অ্যাক্টিভিটি সফলভাবে যাচাই হয়েছে',
				description: 'অ্যাডমিন ড্যাশবোর্ডে নতুন সিকিউরিটি সেশন শুরু হয়েছে। সিস্টেম নিরাপদ রয়েছে।',
				category: 'system',
				link: '/admin/my-activity'
			}
		];

		for (const notif of initialList) {
			try {
				await db.insert(schema.notifications).values({
					id: crypto.randomUUID(),
					title: notif.title,
					description: notif.description,
					category: notif.category || 'order',
					isRead: false,
					link: notif.link || '/admin/orders'
				});
			} catch (e) {
				console.error('Failed to seed notification:', e);
			}
		}
	}
}

