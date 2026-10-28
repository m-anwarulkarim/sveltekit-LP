import type { Product } from './types';

export const productsData: Product[] = [
	{
		id: 'kirkland-minoxidil-5',
		name: 'Kirkland 5% Minoxidil Extra Strength Hair Regrowth Solution',
		slug: 'kirkland-5-minoxidil',
		tagline: 'Clinically proven formula for hair follicle revitalization',
		category: 'beauty-health',
		categoryLabel: 'Beauty & Health',
		subCategory: 'haircare',
		brand: 'Kirkland',
		price: 799,
		originalPrice: 1490,
		rating: 5,
		reviewsCount: 191,
		discountPercent: 46,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/kirkland.svg',
		badge: 'Bestseller',
		badgeColor: 'bg-blue-600 text-white',
		features: ['5% Minoxidil Extra Strength', 'Unscented Topical Solution', 'Dropper Included'],
		description:
			'Kirkland Signature 5% Minoxidil topical solution is clinically proven to help regrow hair in men with androgenetic alopecia.',
		inStock: true
	},
	{
		id: 'ordinary-niacinamide-10',
		name: 'The Ordinary Niacinamide 10% + Zinc 1% Oil Control Serum',
		slug: 'the-ordinary-niacinamide',
		tagline: 'High-strength vitamin and mineral blemish formula',
		category: 'beauty-health',
		categoryLabel: 'Skincare',
		subCategory: 'serums',
		brand: 'The Ordinary',
		price: 1090,
		originalPrice: 1850,
		rating: 5,
		reviewsCount: 202,
		discountPercent: 41,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/ordinary.svg',
		badge: 'Top Rated',
		badgeColor: 'bg-emerald-600 text-white',
		features: ['10% Pure Niacinamide', '1% Zinc PCA', 'Regulates Sebum & Pores'],
		description:
			'A cult-favorite clarifying serum that visibly minimizes enlarged pores, improves skin texture, and balances oil production.',
		inStock: true
	},
	{
		id: 'simple-refreshing-wash',
		name: 'Simple Kind to Skin Refreshing Facial Wash Gel 100% Soap Free',
		slug: 'simple-kind-to-skin-wash',
		tagline: 'Gentle purifying cleanser with multi-vitamins',
		category: 'beauty-health',
		categoryLabel: 'Face Care',
		subCategory: 'cleansers',
		brand: 'Simple',
		price: 760,
		originalPrice: 800,
		rating: 5,
		reviewsCount: 199,
		discountPercent: 5,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/simple-wash.svg',
		badge: 'Gentle',
		badgeColor: 'bg-teal-600 text-white',
		features: ['100% Soap-Free Formula', 'Enriched with Vitamin E & Pro-B5', 'Non-Drying Cleanser'],
		description:
			'Cleanses skin thoroughly while removing dirt, oil, and impurities without stripping natural moisture.',
		inStock: true
	},
	{
		id: 'cosrx-salicylic-cleanser',
		name: 'COSRX Salicylic Acid Daily Gentle Cleanser Exfoliating Wash',
		slug: 'cosrx-salicylic-acid-cleanser',
		tagline: 'Micro-bubble exfoliating acne cleanser with tea tree oil',
		category: 'beauty-health',
		categoryLabel: 'Acne Care',
		subCategory: 'cleansers',
		brand: 'COSRX',
		price: 1050,
		originalPrice: 1500,
		rating: 5,
		reviewsCount: 204,
		discountPercent: 30,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/cosrx.svg',
		badge: 'Hot Deal',
		badgeColor: 'bg-rose-600 text-white',
		features: ['0.5% Salicylic Acid BHA', 'Natural Tea Tree Leaf Oil', 'Unclogs Stubborn Pores'],
		description:
			'Gently cleanses excess sebum and dead skin cells while soothing irritation and preventing breakouts.',
		inStock: true
	},
	{
		id: 'bioderma-sebium-gel',
		name: 'Bioderma Sebium Gel Moussant Purifying Cleansing Foaming Gel',
		slug: 'bioderma-sebium-gel-moussant',
		tagline: 'Dermatological purifying cleanser for combination to oily skin',
		category: 'beauty-health',
		categoryLabel: 'Dermo Care',
		subCategory: 'cleansers',
		brand: 'Bioderma',
		price: 1645,
		originalPrice: 2300,
		rating: 4.8,
		reviewsCount: 55,
		discountPercent: 28,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/bioderma.svg',
		badge: 'Doctor Recommended',
		badgeColor: 'bg-cyan-600 text-white',
		features: ['Zinc & Copper Sulphate Formula', 'D.A.F. Patented Complex', 'Soap-free Physiological pH'],
		description:
			'Limits sebum secretion, purifies the epidermis, and respects the natural cutaneous barrier.',
		inStock: true
	},
	{
		id: 'neutrogena-hydro-boost',
		name: 'Neutrogena Hydro Boost Aqua Gel with Hyaluronic Acid & Amino Acids',
		slug: 'neutrogena-hydro-boost-aqua-gel',
		tagline: 'Water-gel moisturizer with continuous 72hr hydration',
		category: 'beauty-health',
		categoryLabel: 'Hydration',
		subCategory: 'moisturizers',
		brand: 'Neutrogena',
		price: 1400,
		originalPrice: 1850,
		rating: 4.9,
		reviewsCount: 61,
		discountPercent: 24,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/neutrogena.svg',
		badge: 'Best Sale',
		badgeColor: 'bg-indigo-600 text-white',
		features: ['Purified Hyaluronic Acid', 'Electrolytes & Amino Acids', 'Ultra-light Oil-free Texture'],
		description:
			'Instantly quenches dry skin and boosts skins moisture reservoir for supple, bouncy, radiant hydration.',
		inStock: true
	},
	{
		id: 'soundcore-motion-boom',
		name: 'Anker Soundcore Motion Boom Outdoor Bluetooth Stereo Speaker',
		slug: 'soundcore-motion-boom',
		tagline: 'Titanium drivers with BassUp technology and IPX7 waterproof',
		category: 'electronics',
		categoryLabel: 'Audio & Tech',
		subCategory: 'speakers',
		brand: 'Soundcore / Anker',
		price: 8490,
		originalPrice: 10500,
		rating: 5,
		reviewsCount: 88,
		discountPercent: 19,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/soundcore.svg',
		badge: 'New Arrival',
		badgeColor: 'bg-emerald-600 text-white',
		features: ['100% Pure Titanium Diaphragms', '24 Hours Playtime', 'Float on Water IPX7'],
		description:
			'Massive stereo sound designed for outdoors with deep resonant bass and custom EQ.',
		inStock: true
	},
	{
		id: 'oraimo-smart-trimmer',
		name: 'Oraimo SmartGroom Pro Multi-Functional Cordless Trimmer',
		slug: 'oraimo-smart-trimmer',
		tagline: 'Self-sharpening titanium blade with 150min battery runtime',
		category: 'electronics',
		categoryLabel: 'Smart Gadgets',
		subCategory: 'trimmers',
		brand: 'Oraimo',
		price: 1850,
		originalPrice: 2450,
		rating: 4.7,
		reviewsCount: 142,
		discountPercent: 24,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/trimmer.svg',
		badge: 'New Arrival',
		badgeColor: 'bg-teal-600 text-white',
		features: ['Ultra-Sharp Blades', 'Digital Battery Display', 'USB Type-C Fast Charging'],
		description:
			'High-precision grooming with zero pull and long-lasting lithium battery.',
		inStock: true
	},
	{
		id: 'anua-heartleaf-toner',
		name: 'Anua Heartleaf 77% Soothing Facial Toner Hydrating Essence',
		slug: 'anua-heartleaf-77-toner',
		tagline: 'K-Beauty #1 soothing toner for sensitive and redness-prone skin',
		category: 'beauty-health',
		categoryLabel: 'Skincare',
		subCategory: 'serums',
		brand: 'Anua',
		price: 1890,
		originalPrice: 2400,
		rating: 4.9,
		reviewsCount: 340,
		discountPercent: 21,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/anua-toner.svg',
		badge: 'Popular',
		badgeColor: 'bg-amber-600 text-white',
		features: ['77% Houttuynia Cordata Extract', 'pH Sub-Acidic Formula', 'Calms Irritated Skin'],
		description:
			'Intensively calms breakouts and restores healthy hydration barrier.',
		inStock: true
	},
	{
		id: 'cerave-hydrating-cleanser',
		name: 'CeraVe Hydrating Facial Cleanser with Essential Ceramides',
		slug: 'cerave-hydrating-cleanser',
		tagline: 'Dermatologist developed daily non-comedogenic wash',
		category: 'beauty-health',
		categoryLabel: 'Face Care',
		subCategory: 'cleansers',
		brand: 'CeraVe',
		price: 1650,
		originalPrice: 2100,
		rating: 5,
		reviewsCount: 420,
		discountPercent: 21,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/cerave.svg',
		badge: 'Popular',
		badgeColor: 'bg-blue-600 text-white',
		features: ['3 Essential Ceramides', 'MVE Delivery Technology', 'Fragrance-free'],
		description:
			'Cleanses, hydrates and helps restore the protective skin barrier.',
		inStock: true
	},
	{
		id: 'boj-sunscreen-spf50',
		name: 'Beauty of Joseon Relief Sun Rice + Probiotics SPF50+ PA++++',
		slug: 'beauty-of-joseon-relief-sun',
		tagline: 'Organic lightweight chemical sunscreen with rice extract',
		category: 'beauty-health',
		categoryLabel: 'Sun Care',
		subCategory: 'suncare',
		brand: 'Beauty of Joseon',
		price: 1250,
		originalPrice: 1750,
		rating: 5,
		reviewsCount: 512,
		discountPercent: 28,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/boj-sunscreen.svg',
		badge: 'Popular',
		badgeColor: 'bg-rose-600 text-white',
		features: ['30% Rice Extract', 'Grain Fermented Probiotics', 'Zero White Cast'],
		description:
			'Moisturizing sun cream that glides onto skin effortlessly with glowing natural finish.',
		inStock: true
	},
	{
		id: 'aura-spectrum-x',
		name: 'AURA Spectrum X Spatial Planar Magnetic Studio Headphones',
		slug: 'aura-spectrum-x',
		tagline: 'Audiophile planar acoustic transducer with RF wireless',
		category: 'electronics',
		categoryLabel: 'Audio & Tech',
		subCategory: 'headphones',
		brand: 'AURA Studio',
		price: 3490,
		originalPrice: 4290,
		rating: 5,
		reviewsCount: 312,
		discountPercent: 19,
		deliveryTime: '12-24 HOURS',
		image: '/images/headphones.jpg',
		badge: 'New Arrival',
		badgeColor: 'bg-violet-600 text-white',
		features: ['50mm Gold Planar Drivers', 'Low-latency 12ms RF Wireless', '55hr Battery Life'],
		description:
			'Professional grade planar magnetic acoustic system for pristine audio clarity and expansive staging.',
		inStock: true
	},
	{
		id: 'zenith-pulse-anc',
		name: 'ZENITH Pulse ANC Wireless Earbuds with Smart Telemetry Case',
		slug: 'zenith-pulse-anc',
		tagline: 'Dual hybrid dynamic balance armature in-ears',
		category: 'electronics',
		categoryLabel: 'Audio & Tech',
		subCategory: 'earbuds',
		brand: 'Zenith',
		price: 1890,
		originalPrice: 2490,
		rating: 4.8,
		reviewsCount: 184,
		discountPercent: 24,
		deliveryTime: '12-24 HOURS',
		image: '/images/earbuds.jpg',
		badge: 'Bestseller',
		badgeColor: 'bg-indigo-600 text-white',
		features: ['Active Noise Cancellation 42dB', 'OLED Telemetry Display', 'Wireless Qi Charging'],
		description:
			'True wireless spatial acoustics with real-time codec and battery telemetry on the charging capsule.',
		inStock: true
	},
	// Books
	{
		id: 'book-paradoxical-sajid',
		name: 'প্যারাডক্সিক্যাল সাজিদ ১ ও ২ (হার্ডকভার কম্বো প্যাক)',
		slug: 'paradoxical-sajid-combo',
		tagline: 'বিশ্বাসের যুক্তিতর্ক ও সংশয় নিরসনের সর্বাধিক বিক্রিত সিরিজ',
		category: 'books',
		categoryLabel: 'বই ও সাহিত্য',
		subCategory: 'islamic',
		brand: 'গার্ডিয়ান পাবলিকেশন',
		price: 580,
		originalPrice: 850,
		rating: 4.9,
		reviewsCount: 840,
		discountPercent: 32,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/ordinary.svg',
		badge: 'Bestseller',
		badgeColor: 'bg-emerald-600 text-white',
		features: ['প্রিমিয়াম হার্ডকভার বাইন্ডিং', 'লেখক আরিফ আজাদ', 'বুকমার্ক ফ্রি'],
		description: 'যুক্তিবাদী মনস্তত্ত্ব ও বিশ্বাসের দ্বন্দ্বে তরুণ প্রজন্মের সবচেয়ে আলোচিত বেস্টসেলার বই।',
		inStock: true
	},
	{
		id: 'book-recharge-battery',
		name: 'রিচার্জ ইউর ডাউন ব্যাটারি - ঝংকার মাহবুব',
		slug: 'recharge-your-down-battery',
		tagline: 'হতাশা কাটিয়ে জীবনে নতুন উদ্যমে ঘুরে দাঁড়ানোর মোটিভেশনাল গাইড',
		category: 'books',
		categoryLabel: 'বই ও সাহিত্য',
		subCategory: 'self-help',
		brand: 'বাতিঘর',
		price: 320,
		originalPrice: 420,
		rating: 4.8,
		reviewsCount: 420,
		discountPercent: 24,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/kirkland.svg',
		badge: 'Popular',
		badgeColor: 'bg-blue-600 text-white',
		features: ['ঝংকার মাহবুবের সহজ সাবলীল লেখা', 'কালারফুল ইলাস্ট্রেশন', 'বাস্তব জীবনের টিপস'],
		description: 'জীবন যখন ক্লান্তিকর লাগে তখন নিজেকে নতুন করে চার্জ আপ করার জাদুকরী গাইডবুক।',
		inStock: true
	},
	// Smart Gadgets
	{
		id: 'gadget-oraimo-watch4',
		name: 'Oraimo Watch 4 Plus 2.01" HD Display Bluetooth Calling Smartwatch',
		slug: 'oraimo-watch-4-plus',
		tagline: 'Crystal clear Bluetooth calling with 100+ sports modes',
		category: 'smart-gadgets',
		categoryLabel: 'Smart Gadgets',
		subCategory: 'watches',
		brand: 'Oraimo',
		price: 2890,
		originalPrice: 3890,
		rating: 4.9,
		reviewsCount: 230,
		discountPercent: 26,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/trimmer.svg',
		badge: 'Hot Deal',
		badgeColor: 'bg-rose-600 text-white',
		features: ['2.01" Ultra Large HD Screen', 'Wireless BT Calling', '7 Days Battery Life'],
		description: 'Premium metallic finish with 24/7 health monitoring and 100+ customized watch faces.',
		inStock: true
	},
	// Groceries
	{
		id: 'grocery-khalisa-honey',
		name: 'সুন্দরবনের প্রাকৃতিক চাকভাঙা খলিসা ফুলের খাঁটি মধু ৫০০ গ্রাম',
		slug: 'sundarbans-pure-khalisa-honey',
		tagline: '১০০% কাঁচা, অপরিশোধিত ও সরাসরি সুন্দরবনের মৌয়ালদের থেকে সংগৃহীত',
		category: 'groceries',
		categoryLabel: 'গ্রোসারি ও খাদ্য',
		subCategory: 'honey-ghee',
		brand: 'Khaas Food',
		price: 750,
		originalPrice: 950,
		rating: 5,
		reviewsCount: 380,
		discountPercent: 21,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/simple-wash.svg',
		badge: 'Organic',
		badgeColor: 'bg-emerald-600 text-white',
		features: ['১০০% ন্যাচারাল অ্যান্টিঅক্সিডেন্ট', 'কোনো ভেজাল বা সুগার সিরাপ নেই', 'ল্যাব টেস্টেড কোয়ালিটি'],
		description: 'সুন্দরবনের গভীর অরণ্যের খলিসা ফুলের আসল সুবাস ও রোগ প্রতিরোধ ক্ষমতার অমৃত ভাণ্ডার।',
		inStock: true
	},
	// Fashion
	{
		id: 'fashion-aura-drop-tee',
		name: 'AURA Signature Heavyweight 240 GSM Premium Drop-Shoulder Tee',
		slug: 'aura-heavyweight-drop-shoulder-tee',
		tagline: '100% Combed Compact Cotton with minimalist street aesthetic',
		category: 'fashion',
		categoryLabel: 'Fashion & Style',
		subCategory: 't-shirts',
		brand: 'AURA Original',
		price: 850,
		originalPrice: 1200,
		rating: 4.9,
		reviewsCount: 160,
		discountPercent: 29,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/cosrx.svg',
		badge: 'Trending',
		badgeColor: 'bg-violet-600 text-white',
		features: ['240 GSM Heavyweight Fabric', 'Bio-Washed & Silicon Softened', 'Ribbed Lycra Collar'],
		description: 'Ultra comfort relaxed fit drop-shoulder t-shirt that holds shape wash after wash.',
		inStock: true
	},
	// Science Kit
	{
		id: 'science-kit-alor-jholok',
		name: 'অন্যরকম বিজ্ঞানবাক্স - আলোর ঝলক সায়েন্স এক্সপেরিমেন্ট কিট',
		slug: 'onnorokom-bigganbaksho-alor-jholok',
		tagline: 'আলোর মজার ২৫টি জাদুকরী বৈজ্ঞানিক পরীক্ষা ও প্রজেক্ট বক্স',
		category: 'science-kit',
		categoryLabel: 'Science Kit',
		subCategory: 'electricity',
		brand: 'অন্যরকম বিজ্ঞানবাক্স',
		price: 990,
		originalPrice: 1250,
		rating: 5,
		reviewsCount: 290,
		discountPercent: 21,
		deliveryTime: '12-24 HOURS',
		image: '/images/products/neutrogena.svg',
		badge: 'STEM Certified',
		badgeColor: 'bg-amber-600 text-white',
		features: ['২৫টি হাতেকলমে পরীক্ষা', 'ভিডিও টিউটোরিয়াল ম্যানুয়াল', '৭ থেকে ১৬ বছর বয়সী শিশুদের জন্য'],
		description: 'প্যারিস্কোপ, ক্যালাইডোস্কোপ ও আলোর নানা মজার পরীক্ষা তৈরি করে আনন্দের সাথে বিজ্ঞান শেখার শ্রেষ্ঠ উপহার।',
		inStock: true
	}
];

// Helper functions for dynamic storefront sections
export function getBestSaleProducts(all: Product[] = productsData): Product[] {
	return all.filter(
		(p) =>
			p.badge === 'Bestseller' ||
			p.badge === 'Hot Deal' ||
			p.badge === 'Best Sale' ||
			(p.discountPercent && p.discountPercent >= 25)
	);
}

export function getNewArrivals(all: Product[] = productsData): Product[] {
	return all.filter(
		(p) =>
			p.badge === 'New Arrival' ||
			p.badge === 'Gentle' ||
			p.id === 'soundcore-motion-boom' ||
			p.id === 'oraimo-smart-trimmer' ||
			p.id === 'aura-spectrum-x' ||
			p.id === 'gadget-oraimo-watch4'
	);
}

export function getPopularProducts(all: Product[] = productsData): Product[] {
	return all.filter(
		(p) =>
			p.badge === 'Popular' ||
			p.badge === 'Top Rated' ||
			p.badge === 'Trending' ||
			p.reviewsCount >= 180 ||
			p.id === 'ordinary-niacinamide-10' ||
			p.id === 'cerave-hydrating-cleanser' ||
			p.id === 'boj-sunscreen-spf50' ||
			p.id === 'book-paradoxical-sajid'
	);
}
