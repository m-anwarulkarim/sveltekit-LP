import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index.ts';
import * as schema from '#lib/server/db/schema.ts';
import { desc, eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

// Default initial catalog if D1 is fresh
const INITIAL_PRODUCTS = [
	{
		id: 'prod-spectrum-x',
		name: 'AURA Spectrum X',
		slug: 'aura-spectrum-x',
		tagline: '50mm Planar Magnetic Flagship Headphones',
		price: 34900,
		originalPrice: 42900,
		rating: 49,
		reviewsCount: 128,
		image: '/images/headphones.jpg',
		category: 'Hardware',
		badge: 'Flagship',
		inStock: true,
		description: 'Ultra-low distortion planar transducers with Neural ANC 2.0 (-48dB).'
	},
	{
		id: 'prod-wave-earbuds',
		name: 'AURA Wave Spatial Pro',
		slug: 'aura-wave-spatial-pro',
		tagline: 'True Wireless Spatial IEMs with Head Tracking',
		price: 18900,
		originalPrice: 22900,
		rating: 48,
		reviewsCount: 94,
		image: '/images/earbuds.jpg',
		category: 'Audio',
		badge: 'Bestseller',
		inStock: true,
		description: 'Beryllium-coated 11mm dynamic drivers with 36hr battery case.'
	},
	{
		id: 'prod-sound-deck',
		name: 'AURA Creator Sound Deck',
		slug: 'aura-creator-sound-deck',
		tagline: '32-Bit/384kHz Quad-DAC Studio Interface',
		price: 44900,
		originalPrice: 51900,
		rating: 50,
		reviewsCount: 62,
		image: '/images/sound-deck.jpg',
		category: 'Studio',
		badge: 'Studio Grade',
		inStock: true,
		description: 'Motorized conductive faders and balanced 4.4mm Pentaconn output.'
	}
];

const INITIAL_ORDERS = [
	{
		id: 'AUR-984210',
		customerName: 'Marcus Vance',
		customerEmail: 'marcus.v@spatialwave.io',
		shippingAddress: '742 Evergreen Terrace, San Francisco, CA 94107',
		items: JSON.stringify([{ id: 'prod-spectrum-x', name: 'AURA Spectrum X (Obsidian Void)', price: 34900, quantity: 1 }]),
		total: 34900,
		status: 'dispatched'
	},
	{
		id: 'AUR-847291',
		customerName: 'Elena Rostova',
		customerEmail: 'elena@soundcraft.fm',
		shippingAddress: 'Königsallee 45, 40212 Düsseldorf, Germany',
		items: JSON.stringify([
			{ id: 'prod-spectrum-x', name: 'AURA Spectrum X', price: 34900, quantity: 1 },
			{ id: 'prod-wave-earbuds', name: 'AURA Wave Spatial Pro', price: 18900, quantity: 1 }
		]),
		total: 53800,
		status: 'processing'
	},
	{
		id: 'AUR-310542',
		customerName: 'Devon Zhao',
		customerEmail: 'devon@freqstudio.tokyo',
		shippingAddress: 'Roppongi Hills Mori Tower 24F, Minato, Tokyo',
		items: JSON.stringify([{ id: 'prod-sound-deck', name: 'AURA Creator Sound Deck', price: 44900, quantity: 1 }]),
		total: 44900,
		status: 'delivered'
	}
];

export const load: PageServerLoad = async ({ platform }) => {
	// If D1 is available on Cloudflare edge
	if (platform?.env?.DB) {
		const db = getDb(platform.env.DB);

		try {
			// Auto-seed if empty
			const existingProducts = await db.select().from(schema.products).all();
			if (existingProducts.length === 0) {
				for (const p of INITIAL_PRODUCTS) {
					await db.insert(schema.products).values(p).onConflictDoNothing();
				}
			}

			const existingOrders = await db.select().from(schema.orders).all();
			if (existingOrders.length === 0) {
				for (const o of INITIAL_ORDERS) {
					await db.insert(schema.orders).values(o).onConflictDoNothing();
				}
			}

			// Query fresh live data
			const productsList = await db.select().from(schema.products).all();
			const ordersList = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).all();
			const reviewsList = await db.select().from(schema.reviews).orderBy(desc(schema.reviews.createdAt)).all();
			const newsletterList = await db.select().from(schema.newsletter).orderBy(desc(schema.newsletter.createdAt)).all();

			// Calculate telemetry
			const totalRevenue = ordersList
				.filter(o => o.status !== 'refunded')
				.reduce((acc, o) => acc + (o.total || 0), 0);

			return {
				isD1Connected: true,
				products: productsList,
				orders: ordersList,
				reviews: reviewsList,
				newsletter: newsletterList,
				stats: {
					totalRevenueCents: totalRevenue,
					totalOrders: ordersList.length,
					activeOrders: ordersList.filter(o => ['processing', 'dispatched', 'paid'].includes(o.status)).length,
					inStockProducts: productsList.filter(p => p.inStock).length,
					totalSubscribers: newsletterList.length
				}
			};
		} catch (error) {
			console.error('Failed to query D1 database:', error);
		}
	}

	// Resilient fallback for offline / mock testing
	return {
		isD1Connected: false,
		products: INITIAL_PRODUCTS,
		orders: INITIAL_ORDERS,
		reviews: [
			{
				id: 'rev-1',
				productId: 'prod-spectrum-x',
				author: 'Sarah Chen',
				role: 'Grammy-Nominated Producer',
				rating: 5,
				title: 'Sublime planar resolution',
				content: 'Transients hit with shocking surgical precision. You hear elements in mix stems you never noticed before.',
				verified: true,
				createdAt: new Date()
			}
		],
		newsletter: [
			{ id: 'sub-1', email: 'marcus@audiozone.io', createdAt: new Date() },
			{ id: 'sub-2', email: 'elena@soundcraft.fm', createdAt: new Date() }
		],
		stats: {
			totalRevenueCents: 133600,
			totalOrders: 3,
			activeOrders: 2,
			inStockProducts: 3,
			totalSubscribers: 2
		}
	};
};

export const actions: Actions = {
	// Update Order Status (e.g. processing -> dispatched -> delivered)
	updateOrderStatus: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Cloudflare D1 binding unavailable' });
		}
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		const newStatus = data.get('status')?.toString();

		if (!orderId || !newStatus) {
			return fail(400, { message: 'Order ID and Status required' });
		}

		try {
			const db = getDb(platform.env.DB);
			await db.update(schema.orders)
				.set({ status: newStatus })
				.where(eq(schema.orders.id, orderId));
			return { success: true, updatedOrder: orderId, newStatus };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'Failed to update order' });
		}
	},

	// Toggle Product In-Stock / Out-of-Stock
	toggleProductStock: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Cloudflare D1 binding unavailable' });
		}
		const data = await request.formData();
		const productId = data.get('productId')?.toString();
		const inStock = data.get('inStock') === 'true';

		if (!productId) {
			return fail(400, { message: 'Product ID required' });
		}

		try {
			const db = getDb(platform.env.DB);
			await db.update(schema.products)
				.set({ inStock })
				.where(eq(schema.products.id, productId));
			return { success: true, productId, inStock };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'Failed to update product' });
		}
	},

	// Delete a review
	deleteReview: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Cloudflare D1 binding unavailable' });
		}
		const data = await request.formData();
		const reviewId = data.get('reviewId')?.toString();

		if (!reviewId) {
			return fail(400, { message: 'Review ID required' });
		}

		try {
			const db = getDb(platform.env.DB);
			await db.delete(schema.reviews).where(eq(schema.reviews.id, reviewId));
			return { success: true, deletedReview: reviewId };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'Failed to delete review' });
		}
	},

	// Reset / Seed D1 Database with full catalog & test orders
	seedDatabase: async ({ platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Cloudflare D1 binding unavailable' });
		}
		try {
			const db = getDb(platform.env.DB);
			for (const p of INITIAL_PRODUCTS) {
				await db.insert(schema.products).values(p).onConflictDoNothing();
			}
			for (const o of INITIAL_ORDERS) {
				await db.insert(schema.orders).values(o).onConflictDoNothing();
			}
			return { success: true, seeded: true };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'Failed to seed database' });
		}
	}
};
