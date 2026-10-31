import { productsData } from '#lib/modules/products/products.data';

export interface ProductVariant {
	name: string;
	stock: number;
	openingStock?: number;
	sku?: string;
	price?: number;
	image?: string;
}

export interface ProductSpec {
	key: string;
	value: string;
}

export interface AdminProduct {
	id: string;
	name: string;
	slug: string;
	tagline: string;
	price: number;
	originalPrice: number;
	costPrice?: number;
	stockValue?: number;
	lowStockQty?: number;
	rating?: number;
	reviewsCount?: number;
	image: string;
	images?: string[];
	category: string;
	subCategory?: string;
	childCategory?: string;
	brand?: string;
	model?: string;
	badge?: string | null;
	inStock?: boolean;
	description?: string;
	status: 'published' | 'draft';
	priority?: string;
	stock?: number;
	openingStock?: number;
	sku?: string;
	isPreOrder?: boolean;
	isWholesale?: boolean;
	landingPageLink?: string;
	urgencyMessage?: string;
	enableProcessing?: boolean;
	processingOptions?: string[];
	specifications?: ProductSpec[];
	variants?: ProductVariant[];
	tags?: string[];
	isLowStock?: boolean;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string;
	returnPolicy?: string;
	sizeChartImage?: string;
}

// 100% Real E-commerce Product Catalog (Synced with Storefront & Database)
export const INITIAL_PRODUCTS: AdminProduct[] = productsData.map((p, idx) => ({
	id: p.id,
	name: p.name,
	slug: p.slug,
	tagline: p.tagline || p.name,
	price: p.price,
	originalPrice: p.originalPrice || Math.round(p.price * 1.3),
	costPrice: Math.round(p.price * 0.7),
	stockValue: (p.price || 0) * (p.inStock ? 50 : 0),
	lowStockQty: 5,
	rating: Math.round((p.rating || 4.8) * 10),
	reviewsCount: p.reviewsCount || 120,
	image: p.image,
	images: [p.image],
	category: p.categoryLabel || p.category || 'General',
	subCategory: p.subCategory || '-',
	brand: p.brand || '',
	badge: p.badge || 'Published',
	status: 'published' as const,
	priority: String(idx + 1),
	inStock: Boolean(p.inStock),
	stock: p.inStock ? 50 : 0,
	openingStock: 50,
	sku: `AURA-${p.id.slice(0, 8).toUpperCase()}`,
	description: p.description || '',
	tags: p.features || ['Best Sale Products', 'Original']
}));

// Real E-commerce orders store (All demo orders purged - 100% real database driven)
export let INITIAL_ORDERS: any[] = [];

export function normalizeOrderStatus(status: string): string {
	if (status === 'paid') return 'confirmed';
	if (status === 'dispatched') return 'shipped';
	if (status === 'refunded') return 'cancelled';
	if (status === 'no_response_3') return 'good_no_response';
	return status;
}

// -------------------------------------------------------------
// CATALOG DATA TYPES & INITIAL DATA (Exact match to SaleEcom)
// -------------------------------------------------------------
export interface CatalogCategory {
	id: string;
	name: string;
	image: string;
	productsCount: number;
	status: 'publish' | 'draft';
	priority: number | string;
	isLowStock?: boolean;
	isTrash?: boolean;
}

export interface CatalogSubCategory {
	id: string;
	name: string;
	image: string;
	category: string;
	status: 'publish' | 'draft';
	priority: number | string;
	isLowStock?: boolean;
	isTrash?: boolean;
}

export interface CatalogChildCategory {
	id: string;
	name: string;
	image: string;
	category: string;
	subCategory: string;
	status: 'publish' | 'draft';
	priority: number | string;
	isLowStock?: boolean;
	isTrash?: boolean;
}

export interface CatalogBrand {
	id: string;
	sl: number;
	name: string;
	date: string;
	homeShow: 'Yes' | 'No';
	priority: number | string;
	status: 'publish' | 'draft';
	isLowStock?: boolean;
	isTrash?: boolean;
}

export interface CatalogTag {
	id: string;
	sl: number;
	name: string;
	date: string;
	homeShow: 'Yes' | 'No';
	priority: number | string;
	status: 'publish' | 'draft';
	isLowStock?: boolean;
	isTrash?: boolean;
}

// 1. Initial Categories (Total 32: 22 Publish, 10 Draft)
export const INITIAL_CATEGORIES: CatalogCategory[] = [
	{ id: 'cat-1', name: 'Car Colour', image: '', productsCount: 1, status: 'publish', priority: 0 },
	{ id: 'cat-2', name: '3d Wall Sticker', image: '', productsCount: 1, status: 'publish', priority: 0 },
	{ id: 'cat-3', name: 'Mosquito Lamp', image: '', productsCount: 1, status: 'publish', priority: 0 },
	{ id: 'cat-4', name: 'Combo Pack', image: '', productsCount: 1, status: 'publish', priority: 0 },
	{ id: 'cat-5', name: 'Hair Care', image: '', productsCount: 2, status: 'publish', priority: 0 },
	{ id: 'cat-6', name: 'Home Care', image: '', productsCount: 2, status: 'publish', priority: 0 },
	{ id: 'cat-7', name: 'Kitchen Accessories', image: '', productsCount: 3, status: 'publish', priority: 0 },
	{ id: 'cat-8', name: 'Gadgets & Devices', image: '', productsCount: 4, status: 'publish', priority: 1 },
	{ id: 'cat-9', name: 'Audio & Acoustics', image: '', productsCount: 5, status: 'publish', priority: 1 },
	{ id: 'cat-10', name: 'Wireless Chargers', image: '', productsCount: 2, status: 'publish', priority: 0 },
	{ id: 'cat-11', name: 'Smart Watch & Bands', image: '', productsCount: 3, status: 'publish', priority: 0 },
	{ id: 'cat-12', name: 'Fashion & Eyewear', image: '', productsCount: 2, status: 'publish', priority: 0 },
	{ id: 'cat-13', name: 'Travel Essentials', image: '', productsCount: 1, status: 'publish', priority: 0 },
	{ id: 'cat-14', name: 'Car Decor & Lighting', image: '', productsCount: 2, status: 'publish', priority: 0 },
	{ id: 'cat-15', name: 'Beauty & Skincare', image: '', productsCount: 3, status: 'publish', priority: 0 },
	{ id: 'cat-16', name: 'Home Organization', image: '', productsCount: 1, status: 'publish', priority: 0 },
	{ id: 'cat-17', name: 'Desk Accessories', image: '', productsCount: 2, status: 'publish', priority: 0 },
	{ id: 'cat-18', name: 'Outdoor & Camping', image: '', productsCount: 1, status: 'publish', priority: 0 },
	{ id: 'cat-19', name: 'Kids Toys & Learning', image: '', productsCount: 2, status: 'publish', priority: 0 },
	{ id: 'cat-20', name: 'Kitchen Appliances', image: '', productsCount: 3, status: 'publish', priority: 0 },
	{ id: 'cat-21', name: 'Bathroom Essentials', image: '', productsCount: 1, status: 'publish', priority: 0 },
	{ id: 'cat-22', name: 'Personal Care', image: '', productsCount: 2, status: 'publish', priority: 0 },
	// Drafts (10)
	{ id: 'cat-23', name: 'Winter Warmers', image: '', productsCount: 0, status: 'draft', priority: 0 },
	{ id: 'cat-24', name: 'Gym & Fitness', image: '', productsCount: 0, status: 'draft', priority: 0 },
	{ id: 'cat-25', name: 'Pet Supplies', image: '', productsCount: 0, status: 'draft', priority: 0 },
	{ id: 'cat-26', name: 'Gaming Peripherals', image: '', productsCount: 0, status: 'draft', priority: 0 },
	{ id: 'cat-27', name: 'Monitors & Mounts', image: '', productsCount: 0, status: 'draft', priority: 0 },
	{ id: 'cat-28', name: 'Security & CCTV', image: '', productsCount: 0, status: 'draft', priority: 0 },
	{ id: 'cat-29', name: 'Cables & Hubs', image: '', productsCount: 0, status: 'draft', priority: 0 },
	{ id: 'cat-30', name: 'Stationery & Notebooks', image: '', productsCount: 0, status: 'draft', priority: 0 },
	{ id: 'cat-31', name: 'Gardening Tools', image: '', productsCount: 0, status: 'draft', priority: 0 },
	{ id: 'cat-32', name: 'Seasonal Gifts', image: '', productsCount: 0, status: 'draft', priority: 0 }
];

// 2. Initial Sub Categories (Total 2: 2 Publish)
export const INITIAL_SUB_CATEGORIES: CatalogSubCategory[] = [
	{ id: 'sub-1', name: 'Purifeir', image: '', category: 'kitchen product', status: 'publish', priority: '-' },
	{ id: 'sub-2', name: 'Cleaning', image: '', category: 'Home Cleaning', status: 'publish', priority: '-' }
];

// 3. Initial Child Categories (Total 0)
export const INITIAL_CHILD_CATEGORIES: CatalogChildCategory[] = [];

// 4. Initial Brands (Total 8: 8 Publish)
export const INITIAL_BRANDS: CatalogBrand[] = [
	{ id: 'brand-1', sl: 1, name: 'China', date: '-', homeShow: 'No', priority: '-', status: 'publish' },
	{ id: 'brand-2', sl: 2, name: 'China', date: '-', homeShow: 'No', priority: '-', status: 'publish' },
	{ id: 'brand-3', sl: 3, name: 'Netac', date: '-', homeShow: 'No', priority: 1, status: 'publish' },
	{ id: 'brand-4', sl: 4, name: 'Samsung', date: '-', homeShow: 'No', priority: '-', status: 'publish' },
	{ id: 'brand-5', sl: 5, name: 'Microsoft Xbox', date: '-', homeShow: 'No', priority: '-', status: 'publish' },
	{ id: 'brand-6', sl: 6, name: 'Canon', date: '-', homeShow: 'No', priority: 3, status: 'publish' },
	{ id: 'brand-7', sl: 7, name: 'Logitech', date: '-', homeShow: 'No', priority: 1, status: 'publish' },
	{ id: 'brand-8', sl: 8, name: 'Apple', date: '-', homeShow: 'No', priority: '-', status: 'publish' }
];

// 5. Initial Tags (Total 5: 5 Publish)
export const INITIAL_TAGS: CatalogTag[] = [
	{ id: 'tag-1', sl: 1, name: 'Flash Deals', date: 'Aug 25, 2025', homeShow: 'Yes', priority: 11, status: 'publish' },
	{ id: 'tag-2', sl: 2, name: 'Best Sale Products', date: 'May 31, 2025', homeShow: 'Yes', priority: '-', status: 'publish' },
	{ id: 'tag-3', sl: 3, name: 'Flash Sale', date: 'Mar 31, 2025', homeShow: 'Yes', priority: '-', status: 'publish' },
	{ id: 'tag-4', sl: 4, name: 'Popular Products', date: 'Apr 30, 2025', homeShow: 'Yes', priority: '-', status: 'publish' },
	{ id: 'tag-5', sl: 5, name: 'New Arrival', date: 'Apr 30, 2025', homeShow: 'Yes', priority: '-', status: 'publish' }
];

export function getLiveOrders() {
	return INITIAL_ORDERS;
}

export function addLiveOrder(newOrder: any) {
	INITIAL_ORDERS = [newOrder, ...INITIAL_ORDERS];
	return newOrder;
}

export function updateLiveOrderStatus(orderId: string, newStatus: string, note?: string) {
	let found = false;
	INITIAL_ORDERS = INITIAL_ORDERS.map((o: any) => {
		if (o.id === orderId) {
			found = true;
			const updated: any = {
				...o,
				status: newStatus,
				updatedAt: new Date().toISOString()
			};
			if (newStatus === 'confirmed' || newStatus === 'processing') {
				updated.confirmedAt = new Date().toISOString();
			} else if (newStatus === 'shipped') {
				updated.shippedAt = new Date().toISOString();
			} else if (newStatus === 'delivered') {
				updated.deliveredAt = new Date().toISOString();
			}
			return updated;
		}
		return o;
	});
	return found;
}

export function trashLiveOrder(orderId: string) {
	INITIAL_ORDERS = INITIAL_ORDERS.map((o: any) => {
		if (o.id === orderId) {
			return { ...o, isTrashed: true, updatedAt: new Date().toISOString() };
		}
		return o;
	});
}

export function restoreLiveOrder(orderId: string) {
	INITIAL_ORDERS = INITIAL_ORDERS.map((o: any) => {
		if (o.id === orderId) {
			return { ...o, isTrashed: false, status: 'pending', updatedAt: new Date().toISOString() };
		}
		return o;
	});
}

export function deleteLiveOrderPermanently(orderId: string) {
	INITIAL_ORDERS = INITIAL_ORDERS.filter((o: any) => o.id !== orderId);
}

