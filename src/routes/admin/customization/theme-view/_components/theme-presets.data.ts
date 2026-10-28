export interface ThemePreset {
	id: string;
	name: string;
	version: string;
	brand: string;
	description: string;
	previewGradient: string;
	mockupType: 'electronics' | 'leather_bags' | 'fashion' | 'grocery' | 'leather_accessories' | 'ethnic';
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
		id: 'gadgetshob',
		name: 'GadgetShob',
		version: 'V1',
		brand: 'SALECOM',
		description: 'Theme Saleecom - A best e-commerce theme for your business',
		previewGradient: 'from-fuchsia-600 via-pink-600 to-indigo-900',
		mockupType: 'electronics',
		components: {
			productCard: 'product_card_6',
			productCardLabel: 'Product Card 6',
			header: 'header_1',
			headerLabel: 'Header 1',
			showcase: 'showcase_1',
			showcaseLabel: 'Showcase 1',
			footer: 'footer_1',
			footerLabel: 'Footer 1'
		}
	},
	{
		id: 'levoleather',
		name: 'Levoleather',
		version: 'V1',
		brand: 'SALECOM',
		description: 'Theme Saleecom - A best e-commerce theme for your business',
		previewGradient: 'from-amber-600 via-rose-500 to-red-900',
		mockupType: 'leather_bags',
		components: {
			productCard: 'product_card_3',
			productCardLabel: 'Product Card 3',
			header: 'header_2',
			headerLabel: 'Header 2',
			showcase: 'showcase_3',
			showcaseLabel: 'Showcase 3',
			footer: 'footer_3',
			footerLabel: 'Footer 3'
		}
	},
	{
		id: 'labonnobd',
		name: 'Labonnobd',
		version: 'V1',
		brand: 'SALECOM',
		description: 'Theme Saleecom - A best e-commerce theme for your business',
		previewGradient: 'from-pink-500 via-rose-400 to-purple-800',
		mockupType: 'fashion',
		components: {
			productCard: 'product_card_1',
			productCardLabel: 'Product Card 1',
			header: 'header_1',
			headerLabel: 'Header 1',
			showcase: 'showcase_2',
			showcaseLabel: 'Showcase 2',
			footer: 'footer_1',
			footerLabel: 'Footer 1'
		}
	},
	{
		id: 'egoodsy',
		name: 'Egoodsy',
		version: 'V1',
		brand: 'SALECOM',
		description: 'Theme Saleecom - A best e-commerce theme for your business',
		previewGradient: 'from-emerald-500 via-teal-600 to-slate-900',
		mockupType: 'grocery',
		components: {
			productCard: 'product_card_3',
			productCardLabel: 'Product Card 3',
			header: 'header_1',
			headerLabel: 'Header 1',
			showcase: 'showcase_2',
			showcaseLabel: 'Showcase 2',
			footer: 'footer_4',
			footerLabel: 'Footer 4'
		}
	},
	{
		id: 'azwad_leather',
		name: 'Azwad leather',
		version: 'V1',
		brand: 'SALECOM',
		description: 'Theme Saleecom - A best e-commerce theme for your business',
		previewGradient: 'from-stone-700 via-amber-800 to-black',
		mockupType: 'leather_accessories',
		components: {
			productCard: 'product_card_3',
			productCardLabel: 'Product Card 3',
			header: 'header_1',
			headerLabel: 'Header 1',
			showcase: 'showcase_2',
			showcaseLabel: 'Showcase 2',
			footer: 'footer_2',
			footerLabel: 'Footer 2'
		}
	},
	{
		id: 'swaarolipi',
		name: 'Swaarolipi',
		version: 'V1',
		brand: 'SALECOM',
		description: 'Theme Saleecom - A best e-commerce theme for your business',
		previewGradient: 'from-purple-600 via-violet-700 to-indigo-950',
		mockupType: 'ethnic',
		components: {
			productCard: 'product_card_2',
			productCardLabel: 'Product Card 2',
			header: 'header_1',
			headerLabel: 'Header 1',
			showcase: 'showcase_2',
			showcaseLabel: 'Showcase 2',
			footer: 'footer_1',
			footerLabel: 'Footer 1'
		}
	}
];

