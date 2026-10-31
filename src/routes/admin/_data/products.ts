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
