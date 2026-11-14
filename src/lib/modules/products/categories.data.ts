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

export const CATEGORIES_DATA: CategoryInfo[] = [];

export function getCategoryBySlug(slug: string): CategoryInfo {
	const found = CATEGORIES_DATA.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
	if (found) return found;

	const cleanName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
	return {
		id: slug,
		slug,
		name: cleanName,
		nameBn: cleanName,
		desc: `${cleanName} কালেকশন`,
		icon: '📦',
		bannerGradient: 'from-blue-600 to-indigo-900',
		subCategories: [{ id: 'all', name: 'সকল পণ্য', slug: 'all' }],
		brands: []
	};
}
