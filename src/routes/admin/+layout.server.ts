import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { count, eq, sql } from 'drizzle-orm';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { normalizeOrderStatus } from './_data';
import { NotificationService } from '#lib/server/services/notification.service';
import { AdminProfileService } from '#lib/server/services/admin-profile.service';
import { SecurityService } from '#lib/server/services/security.service';
import { CustomerService } from '#lib/server/services/customer.service';
import {
	ADMIN_MENU_LIST,
	hasMenuAccess,
	getMenuIdFromPath,
	getVisibleNotificationCategories
} from '#lib/constants/admin-permissions';

const PRE_CONFIRMATION_STATUSES = new Set([
	'pending',
	'incomplete',
	'no_response',
	'good_no_response',
	'busy',
	'hold'
]);

const POST_CONFIRMATION_STATUSES = new Set([
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
]);

const DHAKA_UTC_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfTodayInDhaka(now = Date.now()): number {
	return Math.floor((now + DHAKA_UTC_OFFSET_MS) / DAY_MS) * DAY_MS - DHAKA_UTC_OFFSET_MS;
}

function percent(part: number, whole: number): string {
	return whole > 0 ? ((part / whole) * 100).toFixed(1) : '0.0';
}

/** One aggregate query replaces loading every order row on every admin page. */
async function loadOrderSummary(db: ReturnType<typeof getDb>) {
	const { orders } = schema;
	const rows = await db
		.select({
			status: orders.status,
			isTrashed: orders.isTrashed,
			orderCount: count(),
			revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
			todayCount: sql<number>`sum(case when ${orders.createdAt} >= ${startOfTodayInDhaka()} then 1 else 0 end)`,
			highValueCount: sql<number>`sum(case when ${orders.total} > 3000 then 1 else 0 end)`
		})
		.from(orders)
		.groupBy(orders.status, orders.isTrashed)
		.all();

	const summary = {
		totalOrders: 0,
		totalRevenue: 0,
		activeOrders: 0,
		confirmedCount: 0,
		confirmedRevenue: 0,
		deliveredCount: 0,
		deliveredRevenue: 0,
		cancelledOrReturned: 0,
		todayOrdersCount: 0,
		trashedCount: 0,
		sidebar: { web: 0, incomplete: 0, orderList: 0, trashed: 0, preOrders: 0 },
		pendingWebOrders: 0
	};

	for (const row of rows) {
		const status = normalizeOrderStatus(row.status);
		const orderCount = Number(row.orderCount) || 0;
		const revenue = Number(row.revenue) || 0;

		if (row.isTrashed) {
			summary.trashedCount += orderCount;
			summary.sidebar.trashed += orderCount;
			continue;
		}

		summary.totalOrders += orderCount;
		summary.todayOrdersCount += Number(row.todayCount) || 0;
		summary.sidebar.preOrders += Number(row.highValueCount) || 0;

		if (status !== 'cancelled') {
			summary.activeOrders += orderCount;
			summary.totalRevenue += revenue;
		} else {
			summary.sidebar.trashed += orderCount;
		}
		if (status === 'delivered') {
			summary.deliveredCount += orderCount;
			summary.deliveredRevenue += revenue;
		}
		if (status === 'cancelled' || status === 'returned') {
			summary.cancelledOrReturned += orderCount;
		}
		if (POST_CONFIRMATION_STATUSES.has(status)) {
			summary.confirmedCount += orderCount;
			summary.confirmedRevenue += revenue;
			summary.sidebar.orderList += orderCount;
		}
		if (PRE_CONFIRMATION_STATUSES.has(status)) {
			summary.pendingWebOrders += orderCount;
			if (status === 'incomplete') summary.sidebar.incomplete += orderCount;
			else summary.sidebar.web += orderCount;
		}
	}

	return summary;
}

async function countRows(db: ReturnType<typeof getDb>, table: any): Promise<number> {
	const [row] = await db.select({ value: count() }).from(table).all();
	return Number(row?.value) || 0;
}

export const load: LayoutServerLoad = async ({ platform, url, locals }) => {
	// hooks.server.ts has already rejected anyone without a valid admin session.
	const currentAdmin = locals.admin!;

	// Route Guarding based on Menu Permissions
	const targetMenuId = getMenuIdFromPath(url.pathname);
	const isOwnerOnlyTarget = ADMIN_MENU_LIST.find((m) => m.id === targetMenuId)?.isOwnerOnly;
	const canAccess = (menuId: string, ownerOnly?: boolean) =>
		hasMenuAccess(currentAdmin.permissions, menuId) && (!ownerOnly || currentAdmin.role === 'Owner');

	if (targetMenuId && !canAccess(targetMenuId, isOwnerOnlyTarget)) {
		const allowedFirst = ADMIN_MENU_LIST.find((m) => canAccess(m.id, m.isOwnerOnly));
		const redirectPath = allowedFirst?.path || '/admin/profile';
		if (url.pathname !== redirectPath) {
			throw redirect(303, redirectPath);
		}
	}

	let isD1Connected = false;
	let ownerProfile: Awaited<ReturnType<typeof AdminProfileService.getProfileById>> = null;
	let unreadNotificationsCount = 0;
	let blockedIpsCount = 0;
	let customersCount = 0;
	let landingPagesCount = 0;
	let galleryCount = 0;
	let productCount = 0;
	let inStockProducts = 0;
	let reviewCount = 0;
	let pendingReviewsCount = 0;
	let subscriberCount = 0;
	let summary: Awaited<ReturnType<typeof loadOrderSummary>> | null = null;

	try {
		const db = getDb(platform);
		const [
			orderSummary,
			products,
			stocked,
			reviews,
			pendingReviews,
			subscribers,
			landingPages,
			media,
			unread,
			blocked,
			customers,
			profile
		] = await Promise.all([
			loadOrderSummary(db).catch((e) => { console.error('loadOrderSummary:', e); return null; }),
			countRows(db, schema.products).catch(() => 0),
			db
				.select({ value: count() })
				.from(schema.products)
				.where(sql`${schema.products.inStock} = 1`)
				.all()
				.catch(() => [{ value: 0 }]),
			countRows(db, schema.reviews).catch(() => 0),
			db
				.select({ value: count() })
				.from(schema.reviews)
				.where(eq(schema.reviews.status, 'pending'))
				.all()
				.catch(() => [{ value: 0 }]),
			countRows(db, schema.newsletter).catch(() => 0),
			countRows(db, schema.landingPages).catch(() => 0),
			countRows(db, schema.mediaAssets).catch(() => 0),
			NotificationService.getUnreadCount(db, getVisibleNotificationCategories(currentAdmin.permissions)).catch(() => 0),
			SecurityService.countBlocked(db).catch(() => 0),
			CustomerService.countCustomers(db).catch(() => 0),
			AdminProfileService.getProfileById(db, currentAdmin.id).catch(() => null)
		]);

		isD1Connected = true;
		summary = orderSummary;
		productCount = products;
		inStockProducts = Number(stocked[0]?.value) || 0;
		reviewCount = reviews;
		pendingReviewsCount = Number(pendingReviews[0]?.value) || 0;
		subscriberCount = subscribers;
		landingPagesCount = landingPages;
		galleryCount = media;
		unreadNotificationsCount = unread;
		blockedIpsCount = blocked;
		customersCount = customers;
		ownerProfile = profile;
	} catch (error) {
		console.error('Failed to query D1 database:', error);
	}

	const totalOrders = summary?.totalOrders ?? 0;
	const activeOrders = summary?.activeOrders ?? 0;
	const totalRevenue = summary?.totalRevenue ?? 0;

	return {
		isD1Connected,
		ownerProfile,
		currentAdmin,
		unreadNotificationsCount,
		blockedIpsCount,
		customersCount,
		landingPagesCount,
		galleryCount,
		pendingReviewsCount,
		sidebarCounts: {
			web: summary?.sidebar.web ?? 0,
			incomplete: summary?.sidebar.incomplete ?? 0,
			orderList: summary?.sidebar.orderList ?? 0,
			trashed: summary?.sidebar.trashed ?? 0,
			preOrders: summary?.sidebar.preOrders ?? 0,
			products: productCount
		},
		entityCounts: {
			products: productCount,
			orders: totalOrders + (summary?.trashedCount ?? 0),
			reviews: reviewCount,
			newsletter: subscriberCount
		},
		stats: {
			totalRevenue,
			confirmedRevenue: summary?.confirmedRevenue ?? 0,
			totalOrders,
			confirmedCount: summary?.confirmedCount ?? 0,
			confirmedRate: percent(summary?.confirmedCount ?? 0, totalOrders),
			deliveredCount: summary?.deliveredCount ?? 0,
			deliveredRevenue: summary?.deliveredRevenue ?? 0,
			deliveredRate: percent(summary?.deliveredCount ?? 0, totalOrders),
			cancelledCount: summary?.cancelledOrReturned ?? 0,
			cancelledRate: percent(summary?.cancelledOrReturned ?? 0, totalOrders),
			aov: totalOrders > 0 ? Math.round(totalRevenue / (activeOrders || 1)) : 0,
			todayOrdersCount: summary?.todayOrdersCount ?? 0,
			webOrdersCount: summary?.pendingWebOrders ?? 0,
			orderListCount: summary?.confirmedCount ?? 0,
			inStockProducts,
			totalSubscribers: subscriberCount,
			trashedCount: summary?.trashedCount ?? 0
		}
	};
};
