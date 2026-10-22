import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index.ts';
import * as schema from '#lib/server/db/schema.ts';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

// Default initial catalog
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

// Realistic E-commerce orders matching Pre-Confirmation (Image 1) and Post-Confirmation (Image 2)
const INITIAL_ORDERS = [
	// -------------------------------------------------------------
	// ১. ওয়েব অর্ডার (Pre-Confirmation: কনফার্মেশনের আগের স্ট্যাটাস)
	// -------------------------------------------------------------
	{
		id: '87472',
		customerName: 'Emon',
		customerEmail: '01741402270',
		shippingAddress: 'Leather centre, g-9 dncc super market, gulshan-2, Dhaka',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X (Black)',
				price: 1466,
				quantity: 1,
				image: '/images/headphones.jpg',
				source: 'Direct',
				timeAgo: '12 minutes ago',
				successRate: { delivered: 30, returned: 2, percent: 95 }
			}
		]),
		total: 1466,
		status: 'pending' // পেন্ডিং
	},
	{
		id: '22026',
		customerName: 'নাম মোঃ সহিদুল ইসলাম খান',
		customerEmail: '01714455381',
		shippingAddress: 'গ্রাম মিলোজয়ার থানা বিশ্বম্ভরপুর জেলা সুনামগঞ্জ',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave Spatial Pro',
				price: 380,
				quantity: 1,
				image: '/images/earbuds.jpg',
				source: 'Direct',
				altPhone: '01781519059',
				timeAgo: '1 day ago',
				successRate: { delivered: 30, returned: 2, percent: 95 }
			}
		]),
		total: 380,
		status: 'pending' // পেন্ডিং
	},
	{
		id: '84650',
		customerName: 'পিহাদ আলম',
		customerEmail: '01345770404',
		shippingAddress: 'ভূঁইয়া সায়িপুুর, পৌরসভা, বাঘতলী, নেত্রকোণা',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Creator Deck Accessory',
				price: 175,
				quantity: 1,
				image: '/images/sound-deck.jpg',
				source: 'Direct',
				timeAgo: '2 days ago',
				successRate: { delivered: 15, returned: 1, percent: 93 }
			}
		]),
		total: 175,
		status: 'pending' // পেন্ডিং
	},
	{
		id: '84651',
		customerName: 'তাহসীন চৌধুরী',
		customerEmail: '01819283741',
		shippingAddress: 'হালিশহর ব্লক-বি, চট্টগ্রাম',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Pro Headband',
				price: 1250,
				quantity: 1,
				source: 'Facebook',
				timeAgo: '3 hours ago',
				successRate: { delivered: 8, returned: 4, percent: 66 }
			}
		]),
		total: 1250,
		status: 'incomplete' // ইনকমপ্লিট
	},
	{
		id: '84652',
		customerName: 'মোস্তাফিজুর রহমান',
		customerEmail: '01711223344',
		shippingAddress: 'আম্বরখানা পয়েন্ট, সিলেট সদর',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave Spatial Pro',
				price: 890,
				quantity: 1,
				source: 'Direct',
				timeAgo: '5 hours ago',
				successRate: { delivered: 20, returned: 5, percent: 80 }
			}
		]),
		total: 890,
		status: 'no_response' // নো রেসপন্স
	},
	{
		id: '84653',
		customerName: 'কামরুল হাসান রাসেল',
		customerEmail: '01912345678',
		shippingAddress: 'জেল রোড, ময়মনসিংহ টাউন',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Studio Interface Pro',
				price: 2100,
				quantity: 1,
				source: 'Facebook',
				timeAgo: '1 day ago',
				successRate: { delivered: 4, returned: 6, percent: 40 }
			}
		]),
		total: 2100,
		status: 'good_no_response' // গুড বাট নো রেসপন্স
	},
	{
		id: '84654',
		customerName: 'শারমিন আক্তার',
		customerEmail: '01678901234',
		shippingAddress: 'চৌহাট্টা, সিলেট সদর',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Earbuds Case',
				price: 650,
				quantity: 1,
				source: 'Direct',
				timeAgo: '2 hours ago',
				successRate: { delivered: 12, returned: 1, percent: 92 }
			}
		]),
		total: 650,
		status: 'busy' // বিজি
	},
	{
		id: '84655',
		customerName: 'সাইফুল ইসলাম',
		customerEmail: '01799887766',
		shippingAddress: 'নিউ মার্কেট এলাকা, রাজশাহী',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X',
				price: 1450,
				quantity: 1,
				source: 'Facebook',
				timeAgo: '6 hours ago',
				successRate: { delivered: 25, returned: 3, percent: 89 }
			}
		]),
		total: 1450,
		status: 'hold' // হোল্ড
	},
	{
		id: '84656',
		customerName: 'নাজমুল সাকিব',
		customerEmail: '01555443322',
		shippingAddress: 'কোর্ট চত্বর, কুষ্টিয়া',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Custom Fader Caps',
				price: 780,
				quantity: 1,
				source: 'Direct',
				timeAgo: '1 day ago',
				successRate: { delivered: 18, returned: 2, percent: 90 }
			}
		]),
		total: 780,
		status: 'recall' // রি (রি-কল)
	},

	// -------------------------------------------------------------
	// ২. অর্ডার তালিকা (Post-Confirmation: কুরিয়ার ও ফুলফিলমেন্ট স্ট্যাটাস)
	// -------------------------------------------------------------
	{
		id: 'INV-1227',
		customerName: 'হোসাইন',
		customerEmail: '01943298190',
		shippingAddress: 'ঝাউদিয়া, পশ্চিমপাড়া (কবরস্থান সংলগ্ন), কুষ্টিয়া',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Spatial IEMs',
				price: 313,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-928174',
				timeAgo: '১ দিন আগে',
				confirmedAt: '১ দিন আগে',
				subStatus: 'partial_delivered'
			}
		]),
		total: 313,
		status: 'partial_delivered' // পার্শিয়াল
	},
	{
		id: 'INV-1108',
		customerName: 'vissho Roy',
		customerEmail: '01305082314',
		shippingAddress: 'গ্রাম চরকলপুকুর থানা পীরগঞ্জ জেলা রংপুর',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Audio Adapter',
				price: 219,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-928091',
				timeAgo: '১ দিন আগে',
				confirmedAt: '১ দিন আগে',
				subStatus: 'partial_delivered'
			}
		]),
		total: 219,
		status: 'partial_delivered' // পার্শিয়াল
	},
	{
		id: 'INV-1229',
		customerName: 'তানভীর আহমেদ',
		customerEmail: '01712345678',
		shippingAddress: 'উত্তরা সেক্টর ৪, রোড ৭, ঢাকা',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X (Obsidian)',
				price: 3490,
				quantity: 1,
				source: 'Direct',
				courier: 'Steadfast',
				trackingCode: 'ST-928501',
				timeAgo: '২ ঘন্টা আগে',
				confirmedAt: '২ ঘন্টা আগে'
			}
		]),
		total: 3490,
		status: 'confirmed' // কনফার্মড
	},
	{
		id: 'INV-1228',
		customerName: 'আরিফুল ইসলাম',
		customerEmail: '01834567890',
		shippingAddress: 'জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave Spatial Pro',
				price: 1890,
				quantity: 1,
				source: 'Facebook',
				courier: 'Pathao',
				trackingCode: 'PT-441208',
				timeAgo: '৫ ঘন্টা আগে',
				confirmedAt: '৫ ঘন্টা আগে'
			}
		]),
		total: 1890,
		status: 'printed' // প্রিন্টেড
	},
	{
		id: 'INV-1225',
		customerName: 'সাদিয়া সুলতানা',
		customerEmail: '01923456781',
		shippingAddress: 'ধানমন্ডি ২৭, ঢাকা ১২০৯',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Creator Sound Deck',
				price: 2750,
				quantity: 1,
				source: 'Direct',
				courier: 'Steadfast',
				trackingCode: 'ST-927914',
				timeAgo: '৮ ঘন্টা আগে',
				confirmedAt: '৮ ঘন্টা আগে'
			}
		]),
		total: 2750,
		status: 'entry_done' // এন্ট্রি ডান
	},
	{
		id: 'INV-1220',
		customerName: 'মেহেদী হাসান শুভ',
		customerEmail: '01765432109',
		shippingAddress: 'বনশ্রী ব্লক সি, রামপুরা, ঢাকা',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X',
				price: 1200,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-926880',
				timeAgo: '১ দিন আগে',
				confirmedAt: '১ দিন আগে'
			}
		]),
		total: 1200,
		status: 'shipped' // শিপড
	},
	{
		id: 'INV-1215',
		customerName: 'নুসরাত জাহান',
		customerEmail: '01612345678',
		shippingAddress: 'হালিশহর ব্লক এ, চট্টগ্রাম',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave Pro',
				price: 850,
				quantity: 1,
				source: 'Direct',
				courier: 'Paperfly',
				trackingCode: 'PF-881230',
				timeAgo: '১ দিন আগে',
				confirmedAt: '১ দিন আগে'
			}
		]),
		total: 850,
		status: 'shipped' // শিপড
	},
	{
		id: 'INV-1190',
		customerName: 'ফারহানা কবীর',
		customerEmail: '01898765432',
		shippingAddress: 'উপশহর মেইন রোড, রাজশাহী',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Sound Deck',
				price: 1450,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-925100',
				timeAgo: '২ দিন আগে',
				confirmedAt: '২ দিন আগে'
			}
		]),
		total: 1450,
		status: 'delivered' // ডেলিভারড
	},
	{
		id: 'INV-1185',
		customerName: 'রাবেয়া খাতুন',
		customerEmail: '01723456789',
		shippingAddress: 'শাহি ঈদগাহ, সিলেট',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave IEM',
				price: 680,
				quantity: 1,
				source: 'Direct',
				courier: 'Steadfast',
				trackingCode: 'ST-924912',
				timeAgo: '৩ দিন আগে',
				confirmedAt: '৩ দিন আগে'
			}
		]),
		total: 680,
		status: 'delivered' // ডেলিভারড
	},
	{
		id: 'INV-1180',
		customerName: 'আব্দুল্লাহ আল নোমান',
		customerEmail: '01512345670',
		shippingAddress: 'আগ্রাবাদ সি/এ, চট্টগ্রাম',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Sound Deck',
				price: 1150,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-923841',
				timeAgo: '৩ দিন আগে',
				confirmedAt: '৩ দিন আগে'
			}
		]),
		total: 1150,
		status: 'pending_return' // পেন্ডিং রিটার্ন
	},
	{
		id: 'INV-1175',
		customerName: 'ইসমাইল হোসেন',
		customerEmail: '01987654321',
		shippingAddress: 'রূপাতলী, বরিশাল',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X',
				price: 920,
				quantity: 1,
				source: 'Facebook',
				courier: 'Pathao',
				trackingCode: 'PT-440120',
				timeAgo: '৪ দিন আগে',
				confirmedAt: '৪ দিন আগে'
			}
		]),
		total: 920,
		status: 'returned' // রিটার্ন
	},
	{
		id: 'INV-1170',
		customerName: 'কামরুল হাসান',
		customerEmail: '01623456789',
		shippingAddress: 'মিরপুর ১০, ঢাকা',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Spatial IEMs',
				price: 540,
				quantity: 1,
				source: 'Direct',
				courier: 'Steadfast',
				trackingCode: 'ST-922194',
				timeAgo: '৫ দিন আগে',
				confirmedAt: '৫ দিন আগে'
			}
		]),
		total: 540,
		status: 'cancelled' // বাতিল
	},
	{
		id: 'INV-1165',
		customerName: 'হাসান ইমাম',
		customerEmail: '01734567891',
		shippingAddress: 'মৌলভীবাজার সদর',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Sound Deck',
				price: 720,
				quantity: 1,
				source: 'Facebook',
				courier: 'Steadfast',
				trackingCode: 'ST-921008',
				timeAgo: '৬ দিন আগে',
				confirmedAt: '৬ দিন আগে'
			}
		]),
		total: 720,
		status: 'missing' // মিসিং
	}
];

// Helper to normalize legacy statuses
function normalizeOrderStatus(status: string): string {
	if (status === 'paid') return 'confirmed';
	if (status === 'processing') return 'entry_done';
	if (status === 'dispatched') return 'shipped';
	if (status === 'refunded') return 'cancelled';
	if (status === 'no_response_3') return 'good_no_response';
	return status;
}

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
			const rawOrders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).all();
			
			// Normalize any legacy status
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
	
	const postConfirmationStatuses = ['confirmed', 'printed', 'entry_done', 'shipped', 'delivered', 'partial_delivered', 'pending_return', 'returned', 'missing'];
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

export const actions: Actions = {
	// Update Order Status (supports both pre-confirmation and post-confirmation statuses)
	updateOrderStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		const newStatus = data.get('status')?.toString();

		if (!orderId || !newStatus) {
			return fail(400, { message: 'Order ID and Status required' });
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.orders)
					.set({ status: newStatus })
					.where(eq(schema.orders.id, orderId));
				return { success: true, updatedOrder: orderId, newStatus };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to update order' });
			}
		}

		return { success: true, updatedOrder: orderId, newStatus };
	},

	// Quick Confirm: instantly move an order from Web Orders to Confirmed Order List
	quickConfirmOrder: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.orders)
					.set({ status: 'confirmed' })
					.where(eq(schema.orders.id, orderId));
				return { success: true, confirmedOrder: orderId };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to confirm order' });
			}
		}

		return { success: true, confirmedOrder: orderId };
	},

	// Quick Cancel: mark an order as cancelled
	quickCancelOrder: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.orders)
					.set({ status: 'cancelled' })
					.where(eq(schema.orders.id, orderId));
				return { success: true, cancelledOrder: orderId };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to cancel order' });
			}
		}

		return { success: true, cancelledOrder: orderId };
	},

	// Courier Sync: sync all courier tracking states
	syncCourier: async ({ request, platform }) => {
		// Simulates syncing with Steadfast / Pathao APIs
		return {
			success: true,
			syncedAt: new Date().toLocaleTimeString('bn-BD'),
			message: 'Steadfast ও Pathao কুরিয়ারের সাথে ট্র্যাকিং সফলভাবে সিঙ্ক হয়েছে!'
		};
	},

	// Create Manual Order
	createManualOrder: async ({ request, platform }) => {
		const data = await request.formData();
		const customerName = data.get('customerName')?.toString();
		const customerPhone = data.get('customerEmail')?.toString() || '01700000000';
		const shippingAddress = data.get('shippingAddress')?.toString();
		const productName = data.get('productName')?.toString() || 'AURA Spectrum X';
		const total = parseInt(data.get('total')?.toString() || '1200', 10);
		const status = data.get('status')?.toString() || 'pending';

		if (!customerName || !shippingAddress) {
			return fail(400, { message: 'কাস্টমার নাম এবং ঠিকানা আবশ্যক।' });
		}

		const newId = 'AUR-' + Math.floor(10000 + Math.random() * 90000);
		const items = JSON.stringify([
			{
				id: 'manual-prod',
				name: productName,
				price: total,
				quantity: 1,
				source: 'Manual Entry',
				timeAgo: 'Just now',
				successRate: { delivered: 1, returned: 0, percent: 100 }
			}
		]);

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.insert(schema.orders).values({
					id: newId,
					customerName,
					customerEmail: customerPhone,
					shippingAddress,
					items,
					total,
					status
				});
				return { success: true, createdOrderId: newId };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'অর্ডার তৈরিতে সমস্যা হয়েছে' });
			}
		}

		return { success: true, createdOrderId: newId };
	},

	// Move Order to Trash
	deleteOrder: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.orders)
					.set({ status: 'cancelled' })
					.where(eq(schema.orders.id, orderId));
				return { success: true, trashedOrder: orderId };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to trash order' });
			}
		}

		return { success: true, trashedOrder: orderId };
	},

	// Restore order from Trash
	restoreOrder: async ({ request, platform }) => {
		const data = await request.formData();
		const orderId = data.get('orderId')?.toString();
		if (!orderId) return fail(400, { message: 'Order ID required' });

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.orders)
					.set({ status: 'pending' })
					.where(eq(schema.orders.id, orderId));
				return { success: true, restoredOrder: orderId };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to restore order' });
			}
		}

		return { success: true, restoredOrder: orderId };
	},

	// Toggle Product In-Stock / Out-of-Stock
	toggleProductStock: async ({ request, platform }) => {
		const data = await request.formData();
		const productId = data.get('productId')?.toString();
		const inStock = data.get('inStock') === 'true';

		if (!productId) {
			return fail(400, { message: 'Product ID required' });
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.products)
					.set({ inStock })
					.where(eq(schema.products.id, productId));
				return { success: true, productId, inStock };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to update product' });
			}
		}

		return { success: true, productId, inStock };
	},

	// Delete a review
	deleteReview: async ({ request, platform }) => {
		const data = await request.formData();
		const reviewId = data.get('reviewId')?.toString();

		if (!reviewId) {
			return fail(400, { message: 'Review ID required' });
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.delete(schema.reviews).where(eq(schema.reviews.id, reviewId));
				return { success: true, deletedReview: reviewId };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to delete review' });
			}
		}

		return { success: true, deletedReview: reviewId };
	},

	// Seed or reseed database with fresh enterprise schema
	seedDatabase: async ({ platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Cloudflare D1 binding unavailable' });
		}

		try {
			const db = getDb(platform.env.DB);
			await db.delete(schema.products);
			for (const p of INITIAL_PRODUCTS) {
				await db.insert(schema.products).values(p);
			}

			await db.delete(schema.orders);
			for (const o of INITIAL_ORDERS) {
				await db.insert(schema.orders).values(o);
			}

			return { success: true, message: 'D1 ডেটাবেজ সফলভাবে রিসিড করা হয়েছে!' };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'ডেটাবেজ সিড করতে ব্যর্থ হয়েছে' });
		}
	}
};
