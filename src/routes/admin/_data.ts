export interface ProductVariant {
	name: string;
	stock: number;
	openingStock?: number;
}

export interface AdminProduct {
	id: string;
	name: string;
	slug: string;
	tagline: string;
	price: number;
	originalPrice: number;
	rating: number;
	reviewsCount: number;
	image: string;
	category: string;
	subCategory?: string;
	badge: string | null;
	inStock: boolean;
	description: string;
	status: 'published' | 'draft';
	priority: string;
	stock?: number;
	openingStock?: number;
	variants?: ProductVariant[];
	tags?: string[];
	isLowStock?: boolean;
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

// Realistic E-commerce orders matching Pre-Confirmation and Post-Confirmation
export const INITIAL_ORDERS = [
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
		status: 'pending'
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
		status: 'pending'
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
		status: 'pending'
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
		status: 'incomplete'
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
				timeAgo: '4 hours ago',
				successRate: { delivered: 22, returned: 1, percent: 95 }
			}
		]),
		total: 890,
		status: 'no_response'
	},
	{
		id: '84653',
		customerName: 'রিফাত মাহমুদ',
		customerEmail: '01911998877',
		shippingAddress: 'সোনারগাঁও রোড, মতিঝিল, ঢাকা',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Sound Deck Unit',
				price: 1850,
				quantity: 1,
				source: 'Facebook',
				timeAgo: '6 hours ago',
				successRate: { delivered: 45, returned: 3, percent: 93 }
			}
		]),
		total: 1850,
		status: 'good_no_response'
	},
	{
		id: '84654',
		customerName: 'তানজিলা হক',
		customerEmail: '01677889900',
		shippingAddress: 'নয়াটোলা, মগবাজার, ঢাকা',
		items: JSON.stringify([
			{
				id: 'prod-spectrum-x',
				name: 'AURA Spectrum X',
				price: 3490,
				quantity: 1,
				source: 'Direct',
				timeAgo: '1 day ago',
				successRate: { delivered: 12, returned: 0, percent: 100 }
			}
		]),
		total: 3490,
		status: 'busy'
	},
	{
		id: '84655',
		customerName: 'জহিরুল ইসলাম',
		customerEmail: '01555667788',
		shippingAddress: 'চৌহাট্টা, সিলেট',
		items: JSON.stringify([
			{
				id: 'prod-wave-earbuds',
				name: 'AURA Wave Earbuds',
				price: 650,
				quantity: 1,
				source: 'Facebook',
				timeAgo: '1 day ago',
				successRate: { delivered: 18, returned: 2, percent: 90 }
			}
		]),
		total: 650,
		status: 'hold'
	},
	{
		id: '84656',
		customerName: 'বশির আহমেদ',
		customerEmail: '01888990011',
		shippingAddress: 'কান্দিরপাড়, কুমিল্লা',
		items: JSON.stringify([
			{
				id: 'prod-sound-deck',
				name: 'AURA Creator Deck',
				price: 2450,
				quantity: 1,
				source: 'Direct',
				timeAgo: '2 days ago',
				successRate: { delivered: 28, returned: 3, percent: 90 }
			}
		]),
		total: 2450,
		status: 'recall'
	},
	// Post-Confirmation Orders
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
		status: 'partial_delivered'
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
		status: 'partial_delivered'
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
		status: 'processing'
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
		status: 'printed'
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
		status: 'entry_done'
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
		status: 'shipped'
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
		status: 'shipped'
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
		status: 'delivered'
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
		status: 'delivered'
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
		status: 'pending_return'
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
		status: 'returned'
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
		status: 'cancelled'
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
		status: 'missing'
	}
];

export function normalizeOrderStatus(status: string): string {
	if (status === 'paid' || status === 'confirmed') return 'processing';
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

