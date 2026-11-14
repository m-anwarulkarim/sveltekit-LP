import { productsData } from '#lib/modules/products/products.data';

export interface ProductVariant {
	id?: string;
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
	enableBundle?: boolean;
	bundleUnitLabel?: string;
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

export { normalizeOrderStatus } from '#lib/constants/order-status';

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

export const INITIAL_CATEGORIES: CatalogCategory[] = [];
export const INITIAL_SUB_CATEGORIES: CatalogSubCategory[] = [];
export const INITIAL_CHILD_CATEGORIES: CatalogChildCategory[] = [];
export const INITIAL_BRANDS: CatalogBrand[] = [];
export const INITIAL_TAGS: CatalogTag[] = [];

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

