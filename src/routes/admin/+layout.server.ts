import type { LayoutServerLoad } from './$types';
import { getDb } from '#lib/server/db/index.ts';
import * as schema from '#lib/server/db/schema.ts';
import { desc } from 'drizzle-orm';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, normalizeOrderStatus } from './_data.ts';

export const load: LayoutServerLoad = async ({ platform }) => {
	let productsList: any[] = INITIAL_PRODUCTS;
	let ordersList: any[] = INITIAL_ORDERS;
	let reviewsList: any[] = [
		{
			id: 'rev-1',
			productId: 'prod-spectrum-x',
			author: 'Sarah Chen',
			role: 'Grammy-Nominated Producer',
			rating: 5,
			title: 'Sublime planar resolution',
			content: 'Transients hit with shocking surgical precision.',
			verified: true,
			createdAt: new Date()
		}
	];
	let newsletterList = [
		{ id: 'sub-1', email: 'marcus@audiozone.io', createdAt: new Date() },
		{ id: 'sub-2', email: 'elena@soundcraft.fm', createdAt: new Date() }
	];
	let isD1Connected = false;

	// If D1 is available on Cloudflare edge
	if (platform?.env?.DB) {
		const db = getDb(platform.env.DB);
		try {
			const existingProducts = await db.select().from(schema.products).all();
			if (existingProducts.length === 0) {
				for (const p of INITIAL_PRODUCTS) {
					const { variants, tags, status, priority, stock, openingStock, subCategory, isLowStock, ...dbProduct } = p as any;
					await db.insert(schema.products).values(dbProduct).onConflictDoNothing();
				}
			}

			const existingOrders = await db.select().from(schema.orders).all();
			if (existingOrders.length === 0) {
				for (const o of INITIAL_ORDERS) {
					await db.insert(schema.orders).values(o).onConflictDoNothing();
				}
			}

			productsList = await db.select().from(schema.products).all();
			const rawOrders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).all();
			
			ordersList = rawOrders.map(o => ({
				...o,
				status: normalizeOrderStatus(o.status)
			}));

			reviewsList = await db.select().from(schema.reviews).orderBy(desc(schema.reviews.createdAt)).all();
			newsletterList = await db.select().from(schema.newsletter).orderBy(desc(schema.newsletter.createdAt)).all();
			isD1Connected = true;
		} catch (error) {
			console.error('Failed to query D1 database:', error);
		}
	}

	// Calculate telemetry
	const totalOrders = ordersList.length;
	const activeOrders = ordersList.filter(o => o.status !== 'cancelled');
	const totalRevenue = activeOrders.reduce((acc, o) => acc + (o.total || 0), 0);
	
	const deliveredOrders = ordersList.filter(o => o.status === 'delivered');
	const deliveredRevenue = deliveredOrders.reduce((acc, o) => acc + (o.total || 0), 0);
	
	const postConfirmationStatuses = ['processing', 'confirmed', 'printed', 'entry_done', 'shipped', 'delivered', 'partial_delivered', 'pending_return', 'returned', 'missing'];
	const confirmedOrders = ordersList.filter(o => postConfirmationStatuses.includes(o.status));
	const confirmedRevenue = confirmedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
	
	const cancelledOrReturnedOrders = ordersList.filter(o => ['cancelled', 'returned'].includes(o.status));
	const pendingWebOrders = ordersList.filter(o => ['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall'].includes(o.status));

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
			todayOrdersCount: 0,
			webOrdersCount: pendingWebOrders.length,
			orderListCount: confirmedOrders.length,
			inStockProducts: productsList.filter(p => p.inStock).length,
			totalSubscribers: newsletterList.length
		}
	};
};
