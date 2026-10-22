export interface Product {
	id: string;
	name: string;
	slug: string;
	tagline: string;
	category: 'headphones' | 'in-ears' | 'studio' | 'digital';
	categoryLabel: string;
	price: number; // in cents
	originalPrice: number;
	rating: number;
	reviewsCount: number;
	image: string;
	badge: string;
	badgeColor: string;
	features: string[];
	description: string;
	inStock: boolean;
}
