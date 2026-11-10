export interface FooterLink {
	label: string;
	href: string;
}

export interface FooterStoreData {
	brandName: string;
	brandTagline: string;
	aboutText: string;
	phoneHotline: string;
	workingHours: string;
	supportEmail: string;
	officeAddress: string;
	facebookUrl: string;
	twitterUrl: string;
	youtubeUrl: string;
	instagramUrl: string;
	copyrightText: string;
	designerCredit: string;
	customerServiceLinks: FooterLink[];
	usefulLinks: FooterLink[];
	categoryLinks: FooterLink[];
}

export const DEFAULT_FOOTER_DATA: FooterStoreData = {
	brandName: 'Store',
	brandTagline: '',
	aboutText: '',
	phoneHotline: '0156007230',
	workingHours: '9:00 AM – 11:00 PM (Everyday)',
	supportEmail: '',
	officeAddress: 'House-23, Road-12, Dhanmondi, Dhaka-1209, Bangladesh',
	facebookUrl: 'https://facebook.com',
	twitterUrl: 'https://x.com',
	youtubeUrl: 'https://youtube.com',
	instagramUrl: 'https://instagram.com',
	copyrightText: `\u00A9 ${new Date().getFullYear()} Store. All rights reserved.`,
	designerCredit: 'Borbila',
	customerServiceLinks: [
		{ label: 'Contact Us', href: '/contact' },
		{ label: 'Track Order', href: '/track-order' },
		{ label: 'Return & Exchange Policy', href: '/return-policy' },
		{ label: 'Privacy Policy', href: '/privacy-policy' },
		{ label: 'Terms & Conditions', href: '/terms' },
		{ label: 'FAQs & Help Center', href: '/faq' }
	],
	usefulLinks: [
		{ label: 'All Products', href: '/catalog/all-product' },
		{ label: 'Hot Deals & Offers', href: '/catalog/all-product?filter=best-sale' },
		{ label: 'New Arrivals', href: '/catalog/all-product?filter=new-arrival' },
		{ label: 'My Account', href: '/account' },
		{ label: 'Order History', href: '/account/orders' },
		{ label: 'About Us', href: '/about' }
	],
	categoryLinks: [
		{ label: 'Skincare & Beauty', href: '/categories/skincare' },
		{ label: 'Audio & Earbuds', href: '/categories/audio' },
		{ label: 'Smart Watches', href: '/categories/smart-watches' },
		{ label: 'Home Essentials', href: '/categories/home' },
		{ label: 'Creator Gadgets', href: '/categories/creator' }
	]
};

