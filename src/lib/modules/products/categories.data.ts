export interface SubCategory {
	id: string;
	name: string;
	slug: string;
}

export interface CategoryInfo {
	id: string;
	slug: string;
	name: string;
	nameBn: string;
	desc: string;
	icon: string;
	bannerGradient: string;
	subCategories: SubCategory[];
	brands: string[];
}

export const CATEGORIES_DATA: CategoryInfo[] = [
	{
		id: 'electronics',
		slug: 'electronics',
		name: 'Electronics & Audio',
		nameBn: 'ইলেকট্রনিক্স ও অডিও',
		desc: 'হাই-ফাই হেডফোন, ব্লুটুথ স্পিকার, স্মার্ট ওয়াচ ও অডিওফাইল সাউন্ড গ্যাজেট',
		icon: '🎧',
		bannerGradient: 'from-blue-600 via-indigo-700 to-slate-900',
		subCategories: [
			{ id: 'all', name: 'সকল ইলেকট্রনিক্স', slug: 'all' },
			{ id: 'headphones', name: 'Headphones', slug: 'headphones' },
			{ id: 'earbuds', name: 'Earbuds & TWS', slug: 'earbuds' },
			{ id: 'speakers', name: 'Bluetooth Speakers', slug: 'speakers' },
			{ id: 'trimmers', name: 'Grooming & Trimmers', slug: 'trimmers' },
			{ id: 'smart-gadgets', name: 'Smart Accessories', slug: 'smart-accessories' }
		],
		brands: ['AURA Studio', 'Soundcore / Anker', 'Oraimo', 'Zenith', 'Sony', 'Baseus']
	},
	{
		id: 'beauty-health',
		slug: 'beauty-health',
		name: 'Beauty & Personal Care',
		nameBn: 'বিউটি ও পার্সোনাল কেয়ার',
		desc: '১০০% অরিজিনাল স্কিনকেয়ার সিরাম, ফেসওয়াশ, ময়েশ্চারাইজার ও হেয়ার ট্রিটমেন্ট',
		icon: '🧴',
		bannerGradient: 'from-purple-600 via-pink-600 to-slate-900',
		subCategories: [
			{ id: 'all', name: 'সকল স্কিনকেয়ার', slug: 'all' },
			{ id: 'serums', name: 'Serums & Essences', slug: 'serums' },
			{ id: 'cleansers', name: 'Facewash & Cleansers', slug: 'cleansers' },
			{ id: 'moisturizers', name: 'Moisturizers & Gels', slug: 'moisturizers' },
			{ id: 'suncare', name: 'Sunscreen & SPF', slug: 'suncare' },
			{ id: 'haircare', name: 'Hair Loss & Regrowth', slug: 'haircare' }
		],
		brands: [
			'The Ordinary',
			'COSRX',
			'CeraVe',
			'Beauty of Joseon',
			'Bioderma',
			'Kirkland',
			'Simple',
			'Anua'
		]
	},
	{
		id: 'books',
		slug: 'books',
		name: 'Books & Literature',
		nameBn: 'বই ও সাহিত্য',
		desc: 'উপন্যাস, অনুবাদ সাহিত্য, ইসলামিক বই, মোটিভেশনাল ও সেলফ ডেভেলপমেন্ট গ্রন্থ',
		icon: '📚',
		bannerGradient: 'from-emerald-700 via-teal-800 to-slate-900',
		subCategories: [
			{ id: 'all', name: 'সকল বই', slug: 'all' },
			{ id: 'novel', name: 'উপন্যাস ও গল্প', slug: 'novel' },
			{ id: 'islamic', name: 'ইসলামিক বই', slug: 'islamic' },
			{ id: 'self-help', name: 'মোটিভেশনাল ও ক্যারিয়ার', slug: 'self-help' },
			{ id: 'sci-fi', name: 'সায়েন্স ফিকশন ও থ্রিলার', slug: 'sci-fi' },
			{ id: 'translation', name: 'অনুবাদ সাহিত্য', slug: 'translation' }
		],
		brands: ['প্রথমা প্রকাশন', 'বাতিঘর', 'অন্বেষা', 'ঐতিহ্য', 'গার্ডিয়ান পাবলিকেশন', 'রকমারি কালেকশন']
	},
	{
		id: 'ebook',
		slug: 'ebook',
		name: 'E-Books & PDFs',
		nameBn: 'ই-বুক ও ডিজিটাল বই',
		desc: 'যেকোনো ডিভাইসে তাৎক্ষণিক পড়ার উপযোগী প্রিমিয়াম ই-বুক ও পিডিএফ সংগ্রহ',
		icon: '📱',
		bannerGradient: 'from-slate-700 via-slate-800 to-slate-950',
		subCategories: [
			{ id: 'all', name: 'সকল ই-বুক', slug: 'all' },
			{ id: 'programming', name: 'প্রোগ্রামিং ও টেক', slug: 'programming' },
			{ id: 'business', name: 'ব্যবসা ও বিনিয়োগ', slug: 'business' },
			{ id: 'academic', name: 'একাডেমিক ই-বুক', slug: 'academic' },
			{ id: 'fiction', name: 'ডিজিটাল ফিকশন', slug: 'fiction' }
		],
		brands: ['AURA Digital', 'TechPress', 'ByteBooks']
	},
	{
		id: 'audiobook',
		slug: 'audiobook',
		name: 'Audiobooks',
		nameBn: 'অডিওবুক ও পডকাস্ট',
		desc: 'মনোমুগ্ধকর কণ্ঠে রেকর্ডকৃত জনপ্রিয় বই, ক্লাসিক উপন্যাস ও অডিও সিরিজ',
		icon: '🎙️',
		bannerGradient: 'from-amber-600 via-orange-700 to-slate-900',
		subCategories: [
			{ id: 'all', name: 'সকল অডিওবুক', slug: 'all' },
			{ id: 'classic', name: 'ক্লাসিক অডিও স্টোরি', slug: 'classic' },
			{ id: 'thriller', name: 'সাসপেন্স ও থ্রিলার', slug: 'thriller' },
			{ id: 'self-growth', name: 'মাইন্ডসেট ও সাকসেস', slug: 'self-growth' }
		],
		brands: ['AURA Voices', 'Kothakosh', 'Dhoni Audio']
	},
	{
		id: 'admission-prep',
		slug: 'admission-prep',
		name: 'Admission & Job Prep',
		nameBn: 'ভর্তি ও চাকুরির প্রস্তুতি',
		desc: 'বিশ্ববিদ্যালয়, মেডিকেল, ইঞ্জিনিয়ারিং ও বিসিএস পরীক্ষার সহায়ক গাইড ও প্রশ্নব্যাংক',
		icon: '🎓',
		bannerGradient: 'from-blue-700 via-indigo-900 to-slate-950',
		subCategories: [
			{ id: 'all', name: 'সকল প্রস্তুতি', slug: 'all' },
			{ id: 'varsity', name: 'বিশ্ববিদ্যালয় ভর্তি', slug: 'varsity' },
			{ id: 'medical', name: 'মেডিকেল গাইড', slug: 'medical' },
			{ id: 'engineering', name: 'বুয়েট ও ইঞ্জিনিয়ারিং', slug: 'engineering' },
			{ id: 'bcs', name: 'বিসিএস ও ব্যাংক জব', slug: 'bcs' }
		],
		brands: ['উদ্ভাস', 'উন্মেষ', 'প্রফেসর’স', 'জয়কলি']
	},
	{
		id: 'stationery',
		slug: 'stationery',
		name: 'Stationery & Office Supplies',
		nameBn: 'স্টেশনারি ও অফিস সামগ্রী',
		desc: 'পেন, ডায়রি, খাতা, মার্কার, অর্গানাইজার ও প্রিমিয়াম আর্ট সরঞ্জাম',
		icon: '✏️',
		bannerGradient: 'from-emerald-600 via-teal-700 to-slate-900',
		subCategories: [
			{ id: 'all', name: 'সকল স্টেশনারি', slug: 'all' },
			{ id: 'notebooks', name: 'নোটবুক ও ডায়রি', slug: 'notebooks' },
			{ id: 'pens', name: 'কলম ও মার্কার', slug: 'pens' },
			{ id: 'art', name: 'আর্ট ও ড্রয়িং কিট', slug: 'art' },
			{ id: 'desk', name: 'ডেস্ক অর্গানাইজার', slug: 'desk' }
		],
		brands: ['Matador', 'Deli', 'Faber-Castell', 'Camlin', 'Good Luck']
	},
	{
		id: 'science-kit',
		slug: 'science-kit',
		name: 'Science & DIY Kits',
		nameBn: 'সায়েন্স ও রোবটিক্স কিট',
		desc: 'শিশুদের বিজ্ঞানের কৌতূহল মেটাতে রোবটিক্স, সায়েন্স এক্সপেরিমেন্ট ও ইলেকট্রনিক্স লার্নিং কিট',
		icon: '🔬',
		bannerGradient: 'from-amber-500 via-orange-600 to-slate-900',
		subCategories: [
			{ id: 'all', name: 'সকল কিট', slug: 'all' },
			{ id: 'robotics', name: 'রোবটিক্স বেসিক', slug: 'robotics' },
			{ id: 'electricity', name: 'তড়িৎ ও চুম্বক বাক্স', slug: 'electricity' },
			{ id: 'chemistry', name: 'রসায়ন পরীক্ষা কিট', slug: 'chemistry' }
		],
		brands: ['অন্যরকম বিজ্ঞানবাক্স', 'RoboShop BD', 'STEM Masters']
	},
	{
		id: 'groceries',
		slug: 'groceries',
		name: 'Daily Groceries & Organics',
		nameBn: 'গ্রোসারি ও অর্গানিক খাদ্য',
		desc: 'খাঁটি মধু, ঘানিভাঙা সরিষার তেল, ড্রাইড নাটস, ঘি ও ফ্রেশ অর্গানিক মুদি পণ্য',
		icon: '🛒',
		bannerGradient: 'from-emerald-700 via-green-800 to-slate-900',
		subCategories: [
			{ id: 'all', name: 'সকল গ্রোসারি', slug: 'all' },
			{ id: 'honey-ghee', name: 'খাঁটি মধু ও ঘি', slug: 'honey-ghee' },
			{ id: 'nuts', name: 'ড্রাই ফ্রুটস ও বাদাম', slug: 'nuts' },
			{ id: 'oils', name: 'ঘানিভাঙা তেল ও মসলা', slug: 'oils' },
			{ id: 'tea-coffee', name: 'চা ও কফি', slug: 'tea-coffee' }
		],
		brands: ['Khaas Food', 'Pushti', 'Pran Organic', 'Radhuni', 'Teer']
	},
	{
		id: 'fashion',
		slug: 'fashion',
		name: 'Fashion & Apparel',
		nameBn: 'ফ্যাশন ও অ্যাপারেল',
		desc: 'ট্রেন্ডি কমফোর্ট টি-শার্ট, স্নিকার্স, ওয়ালেট, বেল্ট ও লাইফস্টাইল কালেকশন',
		icon: '👕',
		bannerGradient: 'from-pink-600 via-rose-700 to-slate-900',
		subCategories: [
			{ id: 'all', name: 'সকল ফ্যাশন', slug: 'all' },
			{ id: 't-shirts', name: 'প্রিমিয়াম টি-শার্ট', slug: 't-shirts' },
			{ id: 'hoodies', name: 'হুডি ও শীতের পোশাক', slug: 'hoodies' },
			{ id: 'footwear', name: 'স্নিকার্স ও জুতো', slug: 'footwear' },
			{ id: 'accessories', name: 'ওয়ালেট ও বেল্ট', slug: 'accessories' }
		],
		brands: ['Fabrilife', 'Apex', 'Bata', 'AURA Original', 'Yellow']
	},
	{
		id: 'smart-gadgets',
		slug: 'smart-gadgets',
		name: 'Smart Gadgets & Wearables',
		nameBn: 'স্মার্ট গ্যাজেটস ও ওয়্যারেবল',
		desc: 'স্মার্টওয়াচ, ফিটনেস ব্যান্ড, ফাস্ট চার্জার ও মাল্টিফাংশনাল টেক গ্যাজেট',
		icon: '⌚',
		bannerGradient: 'from-indigo-600 via-blue-700 to-slate-900',
		subCategories: [
			{ id: 'all', name: 'সকল গ্যাজেট', slug: 'all' },
			{ id: 'watches', name: 'Smart Watches', slug: 'watches' },
			{ id: 'powerbanks', name: 'Powerbanks & Qi', slug: 'powerbanks' },
			{ id: 'chargers', name: 'GaN Fast Chargers', slug: 'chargers' }
		],
		brands: ['Oraimo', 'Xiaomi', 'Haylou', 'Baseus', 'Anker']
	},
	{
		id: 'home-living',
		slug: 'home-living',
		name: 'Home & Living',
		nameBn: 'হোম ও লিভিং',
		desc: 'হোম ডেকর, লাইটিং, এসেনশিয়াল অয়েল ডিফিউজার ও কমফোর্ট লিভিং সামগ্রী',
		icon: '🛋️',
		bannerGradient: 'from-teal-600 via-cyan-800 to-slate-900',
		subCategories: [
			{ id: 'all', name: 'সকল হোম প্রডাক্ট', slug: 'all' },
			{ id: 'decor', name: 'হোম ডেকর ও আর্ট', slug: 'decor' },
			{ id: 'lighting', name: 'স্মার্ট লাইটিং ও ল্যাম্প', slug: 'lighting' },
			{ id: 'storage', name: 'অর্গানাইজার ও স্টোরেজ', slug: 'storage' }
		],
		brands: ['Regal', 'Otobi', 'AURA Living', 'Miniso']
	}
];

export function getCategoryBySlug(slug: string): CategoryInfo {
	const found = CATEGORIES_DATA.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
	if (found) return found;

	// Fallback generic category info
	return {
		id: slug,
		slug,
		name: slug.charAt(0).toUpperCase() + slug.slice(1),
		nameBn: slug,
		desc: 'এক্সক্লুসিভ কালেকশন ও দ্রুততম ডেলিভারি',
		icon: '🛍️',
		bannerGradient: 'from-blue-600 to-indigo-900',
		subCategories: [{ id: 'all', name: 'সকল পণ্য', slug: 'all' }],
		brands: ['AURA Original']
	};
}

