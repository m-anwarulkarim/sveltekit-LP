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

// 20 realistic orders mirroring Trezo Bengali E-commerce dashboard telemetry
const INITIAL_ORDERS = [
	{
		id: 'AUR-10492',
		customerName: 'তানভীর আহমেদ',
		customerEmail: 'tanvir.ahmed@gmail.com',
		shippingAddress: 'বাড়ি #১২, রোড #৪, সেক্টর ৩, উত্তরা, ঢাকা',
		items: JSON.stringify([{ id: 'prod-spectrum-x', name: 'AURA Spectrum X (Obsidian)', price: 1250, quantity: 1 }]),
		total: 1250,
		status: 'delivered'
	},
	{
		id: 'AUR-10491',
		customerName: 'সাদিয়া সুলতানা',
		customerEmail: 'sadia.s@yahoo.com',
		shippingAddress: 'জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম',
		items: JSON.stringify([{ id: 'prod-wave-earbuds', name: 'AURA Wave Spatial Pro', price: 890, quantity: 1 }]),
		total: 890,
		status: 'delivered'
	},
	{
		id: 'AUR-10490',
		customerName: 'রফিকুল ইসলাম',
		customerEmail: 'rafiqul.islam@outlook.com',
		shippingAddress: 'আম্বরখানা, হাউজিং এস্টেট, সিলেট',
		items: JSON.stringify([{ id: 'prod-sound-deck', name: 'AURA Creator Sound Deck', price: 1500, quantity: 1 }]),
		total: 1500,
		status: 'delivered'
	},
	{
		id: 'AUR-10489',
		customerName: 'মেহেদী হাসান শুভ',
		customerEmail: 'mehedi.shuvo@gmail.com',
		shippingAddress: 'ধানমন্ডি ২৭, ঢাকা ১২০৯',
		items: JSON.stringify([{ id: 'prod-spectrum-x', name: 'AURA Spectrum X', price: 800, quantity: 1 }]),
		total: 800,
		status: 'delivered'
	},
	{
		id: 'AUR-10488',
		customerName: 'নুসরাত জাহান',
		customerEmail: 'nusrat.jahan@hotmail.com',
		shippingAddress: 'হালিশহর ব্লক এ, চট্টগ্রাম',
		items: JSON.stringify([{ id: 'prod-wave-earbuds', name: 'AURA Wave Spatial Pro', price: 650, quantity: 1 }]),
		total: 650,
		status: 'dispatched'
	},
	{
		id: 'AUR-10487',
		customerName: 'আরিফুল হক',
		customerEmail: 'ariful.haque@gmail.com',
		shippingAddress: 'মিরপুর ১০ গোলচত্বর, ঢাকা',
		items: JSON.stringify([{ id: 'prod-spectrum-x', name: 'AURA Spectrum X', price: 1200, quantity: 1 }]),
		total: 1200,
		status: 'dispatched'
	},
	{
		id: 'AUR-10486',
		customerName: 'ফারহানা কবীর',
		customerEmail: 'farhana.k@gmail.com',
		shippingAddress: 'উপশহর মেইন রোড, রাজশাহী',
		items: JSON.stringify([{ id: 'prod-sound-deck', name: 'AURA Sound Deck', price: 750, quantity: 1 }]),
		total: 750,
		status: 'processing'
	},
	{
		id: 'AUR-10485',
		customerName: 'জাহিদুল করিম',
		customerEmail: 'zahid.karim@gmail.com',
		shippingAddress: 'ক্যান্টনমেন্ট এলাকা, বগুড়া',
		items: JSON.stringify([{ id: 'prod-wave-earbuds', name: 'AURA Spatial Earbuds', price: 590, quantity: 1 }]),
		total: 590,
		status: 'processing'
	},
	{
		id: 'AUR-10484',
		customerName: 'কামরুল হাসান',
		customerEmail: 'kamrul.hasan@yahoo.com',
		shippingAddress: 'বনশ্রী ব্লক সি, রামপুরা, ঢাকা',
		items: JSON.stringify([{ id: 'prod-spectrum-x', name: 'AURA Spectrum X', price: 820, quantity: 1 }]),
		total: 820,
		status: 'processing'
	},
	{
		id: 'AUR-10483',
		customerName: 'রাবেয়া খাতুন',
		customerEmail: 'rabeya.k@gmail.com',
		shippingAddress: 'শাহি ঈদগাহ, সিলেট',
		items: JSON.stringify([{ id: 'prod-wave-earbuds', name: 'AURA Wave IEM', price: 540, quantity: 1 }]),
		total: 540,
		status: 'paid'
	},
	{
		id: 'AUR-10482',
		customerName: 'আব্দুল্লাহ আল নোমান',
		customerEmail: 'noman.al@outlook.com',
		shippingAddress: 'আগ্রাবাদ সি/এ, চট্টগ্রাম',
		items: JSON.stringify([{ id: 'prod-sound-deck', name: 'AURA Sound Deck', price: 920, quantity: 1 }]),
		total: 920,
		status: 'paid'
	},
	{
		id: 'AUR-10481',
		customerName: 'শামীম ওসমান',
		customerEmail: 'shamim.osman@gmail.com',
		shippingAddress: 'চাষাড়া, নারায়ণগঞ্জ',
		items: JSON.stringify([{ id: 'prod-spectrum-x', name: 'AURA Spectrum X', price: 680, quantity: 1 }]),
		total: 680,
		status: 'paid'
	},
	{
		id: 'AUR-10480',
		customerName: 'তাসনিম রেজা',
		customerEmail: 'tasnim.reza@gmail.com',
		shippingAddress: 'গুলশান ২, রোড ৬২, ঢাকা',
		items: JSON.stringify([{ id: 'prod-wave-earbuds', name: 'AURA Wave Pro', price: 720, quantity: 1 }]),
		total: 720,
		status: 'paid'
	},
	{
		id: 'AUR-10479',
		customerName: 'Mahmudul Hasan',
		customerEmail: 'mahmud.h@gmail.com',
		shippingAddress: 'টঙ্গী কলেজ রোড, গাজীপুর',
		items: JSON.stringify([{ id: 'prod-spectrum-x', name: 'AURA Spectrum X', price: 450, quantity: 1 }]),
		total: 450,
		status: 'refunded'
	},
	{
		id: 'AUR-10478',
		customerName: 'ইসমাইল হোসেন',
		customerEmail: 'ismail.h@yahoo.com',
		shippingAddress: 'রূপাতলী, বরিশাল',
		items: JSON.stringify([{ id: 'prod-sound-deck', name: 'AURA Sound Deck', price: 510, quantity: 1 }]),
		total: 510,
		status: 'refunded'
	},
	{
		id: 'AUR-10477',
		customerName: 'সজীব বর্মণ',
		customerEmail: 'sajib.b@gmail.com',
		shippingAddress: 'সদর রোড, রংপুর',
		items: JSON.stringify([{ id: 'prod-wave-earbuds', name: 'AURA Wave', price: 620, quantity: 1 }]),
		total: 620,
		status: 'refunded'
	},
	{
		id: 'AUR-10476',
		customerName: 'অনিক চৌধুরী',
		customerEmail: 'anik.chy@gmail.com',
		shippingAddress: 'লালখান বাজার, চট্টগ্রাম',
		items: JSON.stringify([{ id: 'prod-spectrum-x', name: 'AURA Spectrum X', price: 400, quantity: 1 }]),
		total: 400,
		status: 'refunded'
	},
	{
		id: 'AUR-10475',
		customerName: 'হাসান ইমাম',
		customerEmail: 'hasan.imam@gmail.com',
		shippingAddress: 'মৌলভীবাজার সদর',
		items: JSON.stringify([{ id: 'prod-sound-deck', name: 'AURA Sound Deck', price: 350, quantity: 1 }]),
		total: 350,
		status: 'paid'
	},
	{
		id: 'AUR-10474',
		customerName: 'জেরিন তাসনিম',
		customerEmail: 'jerin.t@gmail.com',
		shippingAddress: 'বসুন্ধরা আবাসিক এলাকা, ব্লক সি, ঢাকা',
		items: JSON.stringify([{ id: 'prod-wave-earbuds', name: 'AURA Spatial IEM', price: 800, quantity: 1 }]),
		total: 800,
		status: 'paid'
	},
	{
		id: 'AUR-10473',
		customerName: 'ফারুক আহমেদ',
		customerEmail: 'faruk.ahmed@gmail.com',
		shippingAddress: 'টিকাটুলী, ওয়ারী, ঢাকা',
		items: JSON.stringify([{ id: 'prod-spectrum-x', name: 'AURA Spectrum X', price: 690, quantity: 1 }]),
		total: 690,
		status: 'paid'
	}
];

export const load: PageServerLoad = async ({ platform }) => {
	let productsList = INITIAL_PRODUCTS;
	let ordersList = INITIAL_ORDERS;
	let reviewsList = [
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

			productsList = await db.select().from(schema.products).all();
			ordersList = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).all();
			reviewsList = await db.select().from(schema.reviews).orderBy(desc(schema.reviews.createdAt)).all();
			newsletterList = await db.select().from(schema.newsletter).orderBy(desc(schema.newsletter.createdAt)).all();
			isD1Connected = true;
		} catch (error) {
			console.error('Failed to query D1 database:', error);
		}
	}

	// Calculate granular E-Commerce telemetry
	const totalOrders = ordersList.length;
	const validOrders = ordersList.filter(o => o.status !== 'refunded');
	const totalRevenue = validOrders.reduce((acc, o) => acc + (o.total || 0), 0);
	
	const deliveredOrders = ordersList.filter(o => o.status === 'delivered');
	const deliveredRevenue = deliveredOrders.reduce((acc, o) => acc + (o.total || 0), 0);
	
	const confirmedOrders = ordersList.filter(o => ['paid', 'processing', 'dispatched', 'delivered'].includes(o.status));
	const confirmedRevenue = confirmedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
	
	const cancelledOrReturnedOrders = ordersList.filter(o => o.status === 'refunded');
	const pendingOrders = ordersList.filter(o => ['processing', 'dispatched'].includes(o.status));

	const confirmedRate = totalOrders > 0 ? ((confirmedOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
	const deliveredRate = totalOrders > 0 ? ((deliveredOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
	const cancelledRate = totalOrders > 0 ? ((cancelledOrReturnedOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
	const aov = totalOrders > 0 ? Math.round(totalRevenue / (validOrders.length || 1)) : 0;

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
			pendingOrdersCount: pendingOrders.length,
			inStockProducts: productsList.filter(p => p.inStock).length,
			totalSubscribers: newsletterList.length
		}
	};
};

export const actions: Actions = {
	// Update Order Status
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

	// Create Manual Order
	createManualOrder: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Cloudflare D1 binding unavailable' });
		}
		const data = await request.formData();
		const customerName = data.get('customerName')?.toString();
		const customerEmail = data.get('customerEmail')?.toString() || 'customer@store.local';
		const shippingAddress = data.get('shippingAddress')?.toString();
		const productName = data.get('productName')?.toString() || 'AURA Spectrum X';
		const total = parseInt(data.get('total')?.toString() || '1200', 10);
		const status = data.get('status')?.toString() || 'processing';

		if (!customerName || !shippingAddress) {
			return fail(400, { message: 'কাস্টমার নাম এবং ঠিকানা আবশ্যক।' });
		}

		const newId = 'AUR-' + Math.floor(10000 + Math.random() * 90000);
		const items = JSON.stringify([{ id: 'manual-prod', name: productName, price: total, quantity: 1 }]);

		try {
			const db = getDb(platform.env.DB);
			await db.insert(schema.orders).values({
				id: newId,
				customerName,
				customerEmail,
				shippingAddress,
				items,
				total,
				status
			});
			return { success: true, createdOrderId: newId };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'অর্ডার তৈরিতে সমস্যা হয়েছে' });
		}
	},

	// Move Order to Trash (set status to refunded)
	deleteOrder: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Cloudflare D1 binding unavailable' });
		}
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		try {
			const db = getDb(platform.env.DB);
			await db.update(schema.orders)
				.set({ status: 'refunded' })
				.where(eq(schema.orders.id, orderId));
			return { success: true, trashedOrder: orderId };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'Failed to trash order' });
		}
	},

	// Restore order from Trash
	restoreOrder: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Cloudflare D1 binding unavailable' });
		}
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		try {
			const db = getDb(platform.env.DB);
			await db.update(schema.orders)
				.set({ status: 'paid' })
				.where(eq(schema.orders.id, orderId));
			return { success: true, restoredOrder: orderId };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'Failed to restore order' });
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

	// Reset / Seed D1 Database with full 20 orders catalog
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
