import type { LayoutServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { desc } from 'drizzle-orm';
import { normalizeOrderStatus } from './_data';
import { getLiveOrders, syncLiveOrders } from '#lib/server/orders-store';

export const load: LayoutServerLoad = async ({ platform }) => {
	let productsList: any[] = [];
	let ordersList: any[] = [];
	let reviewsList: any[] = [];
	let newsletterList: any[] = [];
	let isD1Connected = false;

	try {
		const db = getDb(platform);
		isD1Connected = true;

		// 1. Fetch real products from D1
		productsList = await db.select().from(schema.products).orderBy(desc(schema.products.createdAt)).all();

		// 2. Fetch real orders from D1 (excluding soft-deleted orders)
		const rawOrders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).all();
		ordersList = rawOrders.map((o) => ({
			...o,
			status: normalizeOrderStatus(o.status)
		}));

		// Synchronize singleton in-memory live orders
		syncLiveOrders(ordersList);

		// 3. Fetch real reviews & newsletter
		reviewsList = await db.select().from(schema.reviews).orderBy(desc(schema.reviews.createdAt)).all();
		newsletterList = await db.select().from(schema.newsletter).orderBy(desc(schema.newsletter.createdAt)).all();
	} catch (error) {
		console.error('Failed to query D1 database:', error);
		ordersList = getLiveOrders();
	}

	// Calculate telemetry from real orders
	const totalOrders = ordersList.length;
	const activeOrders = ordersList.filter((o) => o.status !== 'cancelled');
	const totalRevenue = activeOrders.reduce((acc, o) => acc + (o.total || 0), 0);

	const deliveredOrders = ordersList.filter((o) => o.status === 'delivered');
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
	const confirmedOrders = ordersList.filter((o) => postConfirmationStatuses.includes(o.status));
	const confirmedRevenue = confirmedOrders.reduce((acc, o) => acc + (o.total || 0), 0);

	const cancelledOrReturnedOrders = ordersList.filter((o) => ['cancelled', 'returned'].includes(o.status));
	const pendingWebOrders = ordersList.filter((o) =>
		['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall'].includes(
			o.status
		)
	);

	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const todayOrders = ordersList.filter((o) => {
		const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
		return t >= startOfToday;
	});
	const todayOrdersCount = todayOrders.length;

	const confirmedRate = totalOrders > 0 ? ((confirmedOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
	const deliveredRate = totalOrders > 0 ? ((deliveredOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
	const cancelledRate = totalOrders > 0 ? ((cancelledOrReturnedOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
	const aov = totalOrders > 0 ? Math.round(totalRevenue / (activeOrders.length || 1)) : 0;

	return {
		isD1Connected,
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
			totalSubscribers: newsletterList.length
		}
	};
};
