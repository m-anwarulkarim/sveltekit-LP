import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { normalizeOrderStatus } from './_data';
import { getLiveOrders, syncLiveOrders } from '#lib/server/orders-store';
import { NotificationService } from '#lib/server/services/notification.service';
import { AdminProfileService } from '#lib/server/services/admin-profile.service';
import {
	ADMIN_MENU_LIST,
	hasMenuAccess,
	normalizePermissions,
	getMenuIdFromPath
} from '#lib/constants/admin-permissions';

export const load: LayoutServerLoad = async ({ platform, cookies, url }) => {
	let productsList: any[] = [];
	let ordersList: any[] = [];
	let reviewsList: any[] = [];
	let newsletterList: any[] = [];
	let unreadNotificationsCount = 0;
	let isD1Connected = false;
	let ownerProfile: any = null;
	let currentAdmin: any = null;
	let allAdminUsers: any[] = [];

	try {
		const db = getDb(platform);
		isD1Connected = true;

		// 1. Fetch real products from D1
		productsList = await db.select().from(schema.products).orderBy(desc(schema.products.createdAt)).all();

		// 2. Fetch real orders from D1
		const rawOrders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).all();
		ordersList = rawOrders.map((o) => ({
			...o,
			isTrashed: Boolean(o.isTrashed),
			status: normalizeOrderStatus(o.status)
		}));

		// Synchronize singleton in-memory live orders
		syncLiveOrders(ordersList);

		// 3. Fetch real reviews & newsletter
		reviewsList = await db.select().from(schema.reviews).orderBy(desc(schema.reviews.createdAt)).all();
		newsletterList = await db.select().from(schema.newsletter).orderBy(desc(schema.newsletter.createdAt)).all();

		// 4. Fetch live unread notifications count
		unreadNotificationsCount = await NotificationService.getUnreadCount(db);

		// 5. Fetch Owner profile (Avatar, Name, etc.)
		ownerProfile = await AdminProfileService.getOwnerProfile(db);

		// 6. Fetch Admin Users & Current Active Admin Session
		const rawAdmins = await db
			.select()
			.from(schema.adminUsers)
			.where(eq(schema.adminUsers.isTrashed, false))
			.all();

		allAdminUsers = rawAdmins.map((a) => ({
			id: a.id,
			name: a.name,
			username: a.username,
			email: a.email,
			role: a.role,
			access: a.access,
			permissions: normalizePermissions(a.permissions),
			avatarBg: a.avatarBg,
			avatarText: a.avatarText
		}));

		const activeAdminId = cookies.get('admin_active_id');
		if (activeAdminId) {
			const found = allAdminUsers.find((a) => a.id === activeAdminId);
			if (found && found.access !== 'Suspended') {
				currentAdmin = found;
			}
		}

		if (!currentAdmin) {
			currentAdmin = {
				id: 'owner',
				name: ownerProfile?.name || 'thecolorlighthouse',
				username: ownerProfile?.username || 'thecolorlighthouse',
				email: ownerProfile?.email || 'contact@thecolorlighthouse.com',
				role: 'Owner',
				access: 'Allowed',
				permissions: ['*'],
				avatarBg: 'bg-black text-pink-500 border-pink-500/40',
				avatarText: 'COLOR LIGHT'
			};
		}
	} catch (error) {
		console.error('Failed to query D1 database:', error);
		ordersList = getLiveOrders().map((o: any) => ({
			...o,
			isTrashed: Boolean(o.isTrashed)
		}));
		currentAdmin = {
			id: 'owner',
			name: 'thecolorlighthouse',
			username: 'thecolorlighthouse',
			email: 'contact@thecolorlighthouse.com',
			role: 'Owner',
			access: 'Allowed',
			permissions: ['*'],
			avatarBg: 'bg-black text-pink-500 border-pink-500/40',
			avatarText: 'COLOR LIGHT'
		};
	}

	// 7. Route Guarding based on Menu Permissions
	const targetMenuId = getMenuIdFromPath(url.pathname);
	if (targetMenuId && !hasMenuAccess(currentAdmin.permissions, targetMenuId)) {
		// Find first permitted menu
		const allowedFirst = ADMIN_MENU_LIST.find((m) => hasMenuAccess(currentAdmin.permissions, m.id));
		const redirectPath = allowedFirst?.path || '/admin';
		if (url.pathname !== redirectPath) {
			throw redirect(303, redirectPath);
		}
	}

	// Calculate telemetry from active (non-trashed) orders
	const activeNonTrashed = ordersList.filter((o) => !o.isTrashed);
	const totalOrders = activeNonTrashed.length;
	const activeOrders = activeNonTrashed.filter((o) => o.status !== 'cancelled');
	const totalRevenue = activeOrders.reduce((acc, o) => acc + (o.total || 0), 0);

	const deliveredOrders = activeNonTrashed.filter((o) => o.status === 'delivered');
	const deliveredRevenue = deliveredOrders.reduce((acc, o) => acc + (o.total || 0), 0);

	const postConfirmationStatuses = [
		'processing',
		'confirmed',
		'printed',
		'entry_done',
		'shipped',
		'delivered',
		'partial_delivered',
		'pending_return',
		'returned',
		'missing'
	];
	const confirmedOrders = activeNonTrashed.filter((o) => postConfirmationStatuses.includes(o.status));
	const confirmedRevenue = confirmedOrders.reduce((acc, o) => acc + (o.total || 0), 0);

	const cancelledOrReturnedOrders = activeNonTrashed.filter((o) => ['cancelled', 'returned'].includes(o.status));
	const pendingWebOrders = activeNonTrashed.filter((o) =>
		['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall'].includes(
			o.status
		)
	);

	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const todayOrders = activeNonTrashed.filter((o) => {
		const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
		return t >= startOfToday;
	});
	const todayOrdersCount = todayOrders.length;
	const trashedCount = ordersList.filter((o) => o.isTrashed).length;

	const confirmedRate = totalOrders > 0 ? ((confirmedOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
	const deliveredRate = totalOrders > 0 ? ((deliveredOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
	const cancelledRate = totalOrders > 0 ? ((cancelledOrReturnedOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
	const aov = totalOrders > 0 ? Math.round(totalRevenue / (activeOrders.length || 1)) : 0;

	return {
		isD1Connected,
		ownerProfile,
		currentAdmin,
		allAdminUsers,
		unreadNotificationsCount,
		products: productsList,
		orders: ordersList,
		reviews: reviewsList,
		newsletter: newsletterList,
		stats: {
			totalRevenue,
			confirmedRevenue,
			totalOrders,
			confirmedCount: confirmedOrders.length,
			confirmedRate,
			deliveredCount: deliveredOrders.length,
			deliveredRevenue,
			deliveredRate,
			cancelledCount: cancelledOrReturnedOrders.length,
			cancelledRate,
			aov,
			todayOrdersCount,
			webOrdersCount: pendingWebOrders.length,
			orderListCount: confirmedOrders.length,
			inStockProducts: productsList.filter((p) => p.inStock).length,
			totalSubscribers: newsletterList.length,
			trashedCount
		}
	};
};
