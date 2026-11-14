import type { Product } from './types';

export const productsData: Product[] = [];

// 100% Dynamic Helper functions for real storefront sections

function fillSection(matched: Product[], all: Product[], min: number): Product[] {
	if (matched.length >= min) return matched;
	const ids = new Set(matched.map((p) => p.id));
	const filler = all.filter((p) => !ids.has(p.id));
	return [...matched, ...filler].slice(0, min);
}

export function getBestSaleProducts(all: Product[] = []): Product[] {
	if (!all || all.length === 0) return [];
	const matched = all.filter(
		(p) =>
			p.badge === 'Bestseller' ||
			p.badge === 'Hot Deal' ||
			p.badge === 'Best Sale' ||
			(p.discountPercent !== undefined && p.discountPercent >= 15)
	);
	return fillSection(matched, all, Math.min(matched.length || 4, all.length));
}

export function getNewArrivals(all: Product[] = []): Product[] {
	if (!all || all.length === 0) return [];
	const matched = all.filter(
		(p) =>
			p.badge === 'New Arrival' ||
			p.badge === 'New' ||
			p.badge === 'Just In'
	);
	return fillSection(matched, all, Math.min(matched.length || 4, all.length));
}

export function getPopularProducts(all: Product[] = []): Product[] {
	if (!all || all.length === 0) return [];
	const matched = all.filter(
		(p) =>
			p.badge === 'Popular' ||
			p.badge === 'Top Rated' ||
			p.badge === 'Trending' ||
			(p.reviewsCount !== undefined && p.reviewsCount > 50) ||
			(p.rating !== undefined && p.rating >= 4.5)
	);
	return fillSection(matched, all, Math.min(matched.length || 4, all.length));
}
