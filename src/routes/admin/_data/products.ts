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
