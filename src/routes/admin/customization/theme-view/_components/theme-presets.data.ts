export interface ThemePreset {
	id: string;
	name: string;
	version: string;
	brand: string;
	description: string;
	previewGradient: string;
	badge: string;
	mockupType: 'electronics' | 'fashion' | 'lifestyle';
	colors: {
		primary: string;
		secondary: string;
		tertiary: string;
		primaryLabel: string;
	};
	components: {
		productCard: string;
		productCardLabel: string;
		header: string;
		headerLabel: string;
		showcase: string;
		showcaseLabel: string;
		footer: string;
		footerLabel: string;
	};
}

export const THEME_DESIGN_PRESETS: ThemePreset[] = [
	{
		id: 'aura_modern',
		name: 'AURA Modern',
		version: 'V2.0 PRO',
		brand: 'AURA THEMES',
		badge: 'জনপ্রিয় ও আধুনিক',
		description: 'গ্যাজেট, টেকনোলজি ও ট্রেন্ডি লাইফস্টাইল ই-কমার্স স্টোরের জন্য আল্ট্রা-মডার্ন থিম। ফ্লুইড ক্যারোসেল ব্যানার ও কুইক কার্ট সহ অপ্টিমাইজড ডিজাইন।',
		previewGradient: 'from-[#5845eb] via-indigo-600 to-purple-800',
		mockupType: 'electronics',
		colors: {
			primary: '#5845eb',
			secondary: '#10b981',
			tertiary: '#f43f5e',
			primaryLabel: 'Royal Indigo'
		},
		components: {
			productCard: 'product_card_1',
			productCardLabel: 'Product Card 1 (Classic Clean)',
			header: 'header_1',
			headerLabel: 'Header 1 (Search-Focused)',
			showcase: 'showcase_1',
			showcaseLabel: 'Showcase 1 (Hero Carousel)',
			footer: 'footer_1',
			footerLabel: 'Footer 1 (Full 4-Column)'
		}
	},
	{
		id: 'aura_classic',
		name: 'AURA Classic',
		version: 'V2.0 LUXE',
		brand: 'AURA THEMES',
		badge: 'লাক্সারি ও প্রিমিয়াম',
		description: 'ফ্যাশন, লেদার মার্চেন্ডাইজ ও লাক্সারি পণ্যের জন্য এলিগ্যান্ট থিম। ওয়ার্ম অ্যাম্বার অ্যাকসেন্ট, স্প্লিট গ্রিড শোকেস ও মিনিমাল বর্ডারলেস কার্ড।',
		previewGradient: 'from-amber-600 via-orange-600 to-rose-700',
		mockupType: 'fashion',
		colors: {
			primary: '#ea580c',
			secondary: '#0284c7',
			tertiary: '#e11d48',
			primaryLabel: 'Warm Amber'
		},
		components: {
			productCard: 'product_card_2',
			productCardLabel: 'Product Card 2 (Minimal Borderless)',
			header: 'header_2',
			headerLabel: 'Header 2 (Top Accent Bar)',
			showcase: 'showcase_2',
			showcaseLabel: 'Showcase 2 (Split Banner Grid)',
			footer: 'footer_2',
			footerLabel: 'Footer 2 (Compact Brand)'
		}
	}
];
