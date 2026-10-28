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

// Default initial catalog matching the screenshot reference
export const INITIAL_PRODUCTS: AdminProduct[] = [
	{
		id: 'prod-paint-pen',
		name: 'Car Paint Touch-up Pen',
		slug: 'car-paint-touch-up-pen',
		tagline: 'Professional automotive scratch and swirl repair pen',
		price: 490,
		originalPrice: 750,
		rating: 49,
		reviewsCount: 312,
		image: '/images/products/car-paint-pen.svg',
		category: 'CAR COLOUR',
		subCategory: '-',
		badge: 'Published',
		status: 'published',
		priority: '-',
		inStock: true,
		description: 'High-precision brush pen matching factory car colors for fast scratch repair.',
		variants: [
			{ name: 'WHITE', stock: 9997, openingStock: 0 },
			{ name: 'BLACK', stock: 9995, openingStock: 0 },
			{ name: 'RED', stock: 8420, openingStock: 0 },
			{ name: 'SILVER', stock: 7610, openingStock: 0 },
			{ name: 'BLUE', stock: 6450, openingStock: 0 }
		],
		tags: ['Best Sale Products', 'New Arrival', 'Car Care']
	},
	{
		id: 'prod-window-sticker',
		name: '3d Window View Wall Sticker',
		slug: '3d-window-view-wall-sticker',
		tagline: 'Scenic realistic 3D window illusion wall decal for home decor',
		price: 650,
		originalPrice: 990,
		rating: 48,
		reviewsCount: 185,
		image: '/images/products/window-sticker.svg',
		category: '3D WALL STICKER',
		subCategory: '-',
		badge: 'Published',
		status: 'published',
		priority: '-',
		inStock: true,
		stock: 9997,
		openingStock: 10000,
		description: 'Removable and waterproof PVC wall art giving a fresh open-window view.',
		tags: ['New Arrival']
	},
	{
		id: 'prod-mosquito-lamp',
		name: 'Electric Shock Mosquito Killing Lamp',
		slug: 'electric-shock-mosquito-killing-lamp',
		tagline: '360° bionic UV trap with silent electric mosquito exterminator',
		price: 890,
		originalPrice: 1250,
		rating: 49,
		reviewsCount: 420,
		image: '/images/products/mosquito-lamp.svg',
		category: 'Mosquito lamp',
		subCategory: '-',
		badge: 'Published',
		status: 'published',
		priority: '-',
		inStock: true,
		stock: 493,
		openingStock: 0,
		description: 'Safe physical mosquito eradication without chemical sprays, USB rechargeable.',
		tags: ['Best Sale Products', 'New Arrival']
	},
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
		subCategory: 'Audio',
		badge: 'Flagship',
		status: 'published',
		priority: '1',
		inStock: true,
		stock: 145,
		openingStock: 200,
		description: 'Ultra-low distortion planar transducers with Neural ANC 2.0 (-48dB).',
		tags: ['Best Sale Products', 'Premium']
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
		subCategory: 'Earphones',
		badge: 'Bestseller',
		status: 'published',
		priority: '2',
		inStock: true,
		description: 'High performance spatial audio earbuds with head tracking.',
		variants: [
			{ name: 'MATTE WHITE', stock: 450, openingStock: 500 },
			{ name: 'JET BLACK', stock: 380, openingStock: 400 }
		],
		tags: ['New Arrival', 'Bestseller']
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
		subCategory: 'Pro Audio',
		badge: 'Studio Grade',
		status: 'published',
		priority: '3',
		inStock: true,
		stock: 65,
		openingStock: 100,
		description: 'Motorized conductive faders and balanced 4.4mm Pentaconn output.',
		tags: ['Studio Grade']
	},
	{
		id: 'prod-led-strip',
		name: 'Smart RGB Wireless Ambient Backlight',
		slug: 'smart-rgb-wireless-ambient-backlight',
		tagline: 'Sync with TV screen audio & music ambient light strips',
		price: 1250,
		originalPrice: 1800,
		rating: 47,
		reviewsCount: 88,
		image: '/images/products/window-sticker.svg',
		category: 'Lighting',
		subCategory: 'Smart Home',
		badge: 'Low Stock',
		status: 'published',
		priority: '-',
		inStock: true,
		isLowStock: true,
		stock: 4,
		openingStock: 50,
		description: 'App-controlled dynamic color chase mode with built-in mic sync.',
		tags: ['New Arrival']
	},
	{
		id: 'prod-car-mount',
		name: 'Magnetic Qi Fast Car Charger Mount',
		slug: 'magnetic-qi-fast-car-charger-mount',
		tagline: '15W auto-clamping magnetic vent holder for smartphones',
		price: 950,
		originalPrice: 1400,
		rating: 46,
		reviewsCount: 52,
		image: '/images/products/car-paint-pen.svg',
		category: 'CAR COLOUR',
		subCategory: 'Accessories',
		badge: 'Draft',
		status: 'draft',
		priority: '-',
		inStock: false,
		stock: 0,
		openingStock: 0,
		description: 'Strong Neodymium magnets with intelligent FOD overheat protection.',
		tags: ['Accessories']
	}
];

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

