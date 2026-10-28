export interface Product {
	id: string;
	name: string;
	slug: string;
	tagline?: string;
	category: string;
	categoryLabel: string;
	subCategory?: string;
	brand?: string;
	price: number; // in BDT Taka
	originalPrice: number;
	rating: number;
	reviewsCount: number;
	image: string;
	badge?: string;
	badgeColor?: string;
	discountPercent?: number;
	deliveryTime?: string; // e.g. '12-24 HOURS'
	features?: string[];
	description?: string;
	inStock?: boolean;
}
