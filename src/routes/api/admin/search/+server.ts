import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { like, or, and, eq, ne } from 'drizzle-orm';

const ADMIN_NAV_LINKS = [
	{ title: 'Dashboard Overview', path: '/admin', group: 'Navigation', icon: 'dashboard', keywords: 'home overview analytics বিক্রয়' },
	{ title: 'New Order (Create)', path: '/admin/orders/new', group: 'Orders', icon: 'plus-order', keywords: 'manual order add new অর্ডার তৈরি' },
	{ title: 'Web Orders', path: '/admin/orders', group: 'Orders', icon: 'orders', keywords: 'recent web live orders ওয়েব অর্ডার' },
	{ title: 'Order List (Pipeline)', path: '/admin/orders/list', group: 'Orders', icon: 'orders-list', keywords: 'confirmed processing shipped delivered অর্ডার লিস্ট' },
	{ title: 'Incomplete Orders', path: '/admin/orders/incomplete', group: 'Orders', icon: 'incomplete', keywords: 'abandoned cart incomplete ড্রাফট অর্ডার' },
	{ title: 'Pre-Orders', path: '/admin/orders/pre', group: 'Orders', icon: 'pre-order', keywords: 'advance booking প্রি অর্ডার' },
	{ title: 'Trash Orders', path: '/admin/orders/trash', group: 'Orders', icon: 'trash', keywords: 'deleted trash ট্র্যাশ অর্ডার' },
	{ title: 'Products List', path: '/admin/products', group: 'Products', icon: 'products', keywords: 'items catalog stock ইনভেন্টরি প্রোডাক্ট' },
	{ title: 'Add New Product', path: '/admin/products/new', group: 'Products', icon: 'plus-product', keywords: 'create product new আইটেম যোগ' },
	{ title: 'Categories', path: '/admin/catalog/categories', group: 'Catalog', icon: 'categories', keywords: 'parent category ক্যাটাগরি' },
	{ title: 'Sub Categories', path: '/admin/catalog/sub-categories', group: 'Catalog', icon: 'sub-categories', keywords: 'sub cat সাব ক্যাটাগরি' },
	{ title: 'Child Categories', path: '/admin/catalog/child-categories', group: 'Catalog', icon: 'child-categories', keywords: 'child cat চাইল্ড ক্যাটাগরি' },
	{ title: 'Brands', path: '/admin/catalog/brands', group: 'Catalog', icon: 'brands', keywords: 'brand manufacturer ব্র্যান্ড' },
	{ title: 'Tags', path: '/admin/catalog/tags', group: 'Catalog', icon: 'tags', keywords: 'labels product tags ট্যাগ' },
	{ title: 'Carousel Management', path: '/admin/customization/carousel', group: 'Customization', icon: 'carousel', keywords: 'hero slider slider banner স্লাইডার' },
	{ title: 'Add New Carousel', path: '/admin/customization/edit-carousel/new', group: 'Customization', icon: 'plus-carousel', keywords: 'create slider নতুন ব্যানার' },
	{ title: 'Banner Management', path: '/admin/customization/banner', group: 'Customization', icon: 'banner', keywords: 'promo banner ব্যানার' },
	{ title: 'PopUp Management', path: '/admin/customization/popup', group: 'Customization', icon: 'popup', keywords: 'modal offer popup পপআপ' },
	{ title: 'Theme View & Customization', path: '/admin/customization/theme-view', group: 'Customization', icon: 'theme', keywords: 'theme design appearance থিম কাস্টমাইজ' },
	{ title: 'Landing Pages', path: '/admin/landing-page', group: 'Marketing', icon: 'landing', keywords: 'funnel single product ল্যান্ডিং পেজ' },
	{ title: 'Daily Target & Sales', path: '/admin/daily-target', group: 'Analytics', icon: 'target', keywords: 'target revenue sales লক্ষ্যমাত্রা' },
	{ title: 'Coupons & Discounts', path: '/admin/coupon', group: 'Marketing', icon: 'coupon', keywords: 'promo voucher discount কুপন ডিসকাউন্ট' },
	{ title: 'Customer 360 & CRM', path: '/admin/customer', group: 'Customers', icon: 'customer', keywords: 'buyers users crm কাস্টমার' },
	{ title: 'Customer Reviews', path: '/admin/reviews', group: 'Feedback', icon: 'reviews', keywords: 'ratings reviews ফিডব্যাক রিভিউ' },
	{ title: 'Courier API Settings', path: '/admin/settings/courier', group: 'Settings', icon: 'courier', keywords: 'steadfast pathao redx কুরিয়ার সেটআপ' },
	{ title: 'Invoice & Memo Settings', path: '/admin/settings/invoice-settings', group: 'Settings', icon: 'invoice', keywords: 'invoice print memo চালান ইনভয়েস' },
	{ title: 'General Store Settings', path: '/admin/settings/general', group: 'Settings', icon: 'settings', keywords: 'store config general সাধারণ সেটিংস' },
	{ title: 'IP Block & Firewall', path: '/admin/ip-block', group: 'Security', icon: 'security', keywords: 'fraud ban block আইপি ব্লক' },
	{ title: 'Media Gallery', path: '/admin/gallery', group: 'Media', icon: 'gallery', keywords: 'images upload media ছবি গ্যালারি' },
	{ title: 'Vendor Admins', path: '/admin/admin-control', group: 'Security', icon: 'admin-control', keywords: 'roles permissions admin control অ্যাডমিন' },
	{ title: 'Notifications', path: '/admin/notifications', group: 'System', icon: 'notifications', keywords: 'alerts bell নোটিফিকেশন' },
	{ title: 'Admin Profile', path: '/admin/profile', group: 'System', icon: 'profile', keywords: 'my account password প্রোফাইল' }
];

export const GET: RequestHandler = async ({ url, platform }) => {
	const q = (url.searchParams.get('q') || '').trim();
	const cleanQ = q.replace(/^#/, '').trim();

	// If empty query, return top suggested navigation shortcuts
	if (!cleanQ) {
		const suggestions = ADMIN_NAV_LINKS.slice(0, 8);
		return json({
			query: '',
			orders: [],
			products: [],
			customers: [],
			navigation: suggestions
		});
	}

	const lowerQ = cleanQ.toLowerCase();

	// 1. Search Navigation Shortcuts
	const matchedNav = ADMIN_NAV_LINKS.filter(
		(item) =>
			item.title.toLowerCase().includes(lowerQ) ||
			item.group.toLowerCase().includes(lowerQ) ||
			item.keywords.toLowerCase().includes(lowerQ) ||
			item.path.toLowerCase().includes(lowerQ)
	).slice(0, 6);

	try {
		const db = getDb(platform);

		// 2. Search Orders in Cloudflare D1
		let matchedOrders: any[] = [];
		try {
			matchedOrders = await db
				.select({
					id: schema.orders.id,
					orderNumber: schema.orders.orderNumber,
					customerName: schema.orders.customerName,
					customerPhone: schema.orders.customerPhone,
					total: schema.orders.total,
					status: schema.orders.status,
					createdAt: schema.orders.createdAt
				})
				.from(schema.orders)
				.where(
					and(
						eq(schema.orders.isTrashed, false),
						or(
							like(schema.orders.id, `%${cleanQ}%`),
							like(schema.orders.orderNumber, `%${cleanQ}%`),
							like(schema.orders.customerName, `%${cleanQ}%`),
							like(schema.orders.customerPhone, `%${cleanQ}%`),
							like(schema.orders.shippingAddress, `%${cleanQ}%`)
						)
					)
				)
				.limit(6)
				.all();
		} catch (orderErr) {
			console.error('Search API: Error searching orders:', orderErr);
		}

		// 3. Search Products in Cloudflare D1
		let matchedProducts: any[] = [];
		try {
			matchedProducts = await db
				.select({
					id: schema.products.id,
					name: schema.products.name,
					price: schema.products.price,
					stock: schema.products.stock,
					image: schema.products.image,
					category: schema.products.category,
					status: schema.products.status
				})
				.from(schema.products)
				.where(
					and(
						ne(schema.products.status, 'archived'),
						or(
							like(schema.products.name, `%${cleanQ}%`),
							like(schema.products.category, `%${cleanQ}%`),
							like(schema.products.model, `%${cleanQ}%`)
						)
					)
				)
				.limit(6)
				.all();
		} catch (prodErr) {
			console.error('Search API: Error searching products:', prodErr);
		}

		// 4. Search Customers in Cloudflare D1
		let matchedCustomers: any[] = [];
		try {
			matchedCustomers = await db
				.select({
					id: schema.customers.id,
					name: schema.customers.name,
					phone: schema.customers.phone,
					totalOrders: schema.customers.totalOrders,
					totalSpent: schema.customers.totalSpent,
					city: schema.customers.city
				})
				.from(schema.customers)
				.where(
					or(
						like(schema.customers.name, `%${cleanQ}%`),
						like(schema.customers.phone, `%${cleanQ}%`),
						like(schema.customers.address, `%${cleanQ}%`)
					)
				)
				.limit(6)
				.all();
		} catch (custErr) {
			console.error('Search API: Error searching customers:', custErr);
		}

		return json({
			query: cleanQ,
			orders: matchedOrders,
			products: matchedProducts,
			customers: matchedCustomers,
			navigation: matchedNav
		});
	} catch (globalErr) {
		console.error('Search API unhandled failure:', globalErr);
		return json({
			query: cleanQ,
			orders: [],
			products: [],
			customers: [],
			navigation: matchedNav
		});
	}
};
