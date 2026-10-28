export interface HeaderNavMenuItem {
	label: string;
	href: string;
	badge?: string;
}

export interface HeaderStoreData {
	brandName: string;
	announcementText: string;
	freeShippingThreshold: number;
	phoneHotline: string;
	menuItems: HeaderNavMenuItem[];
}

export const DEFAULT_HEADER_DATA: HeaderStoreData = {
	brandName: 'AURA',
	announcementText: '৳৬০০+ অর্ডার করলেই ডেলিভারি সম্পূর্ণ ফ্রি!',
	freeShippingThreshold: 600,
	phoneHotline: '01602867954',
	menuItems: [
		{ label: 'হোম', href: '/' },
		{ label: 'সকল পণ্য', href: '/catalog/all-product' },
		{ label: 'হট ডিলস', href: '/catalog/all-product?filter=best-sale', badge: 'HOT' },
		{ label: 'নতুন কালেকশন', href: '/catalog/all-product?filter=new-arrival', badge: 'NEW' },
		{ label: 'কাস্টমার সাপোর্ট', href: '/contact' }
	]
};

