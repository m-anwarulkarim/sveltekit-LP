/**
 * Enterprise SEO & Structured Data (JSON-LD) Service
 * Following Google Search Central & Schema.org Standards
 */

export interface SiteConfig {
	siteName: string;
	siteUrl: string;
	logoUrl?: string;
	phone?: string;
	email?: string;
}

export interface ProductSeoData {
	name: string;
	description: string;
	slug: string;
	price: number;
	regularPrice?: number;
	inStock?: boolean;
	image?: string;
	sku?: string;
	ratingValue?: number;
	reviewCount?: number;
	brandName?: string;
}

export interface LandingPageSeoData {
	name: string;
	description?: string;
	slug: string;
	price?: number;
	regularPrice?: number;
	inStock?: boolean;
	image?: string;
	sku?: string;
	brandName?: string;
}

export interface BreadcrumbItem {
	name: string;
	url: string;
}

export class SeoService {
	static readonly FALLBACK_SITE_NAME = 'Store';
	static readonly FALLBACK_SITE_URL = 'https://example.com';
	static readonly DEFAULT_IMAGE = '/apple-touch-icon.png';

	static resolveSite(site?: Partial<SiteConfig> | string): { name: string; url: string; logo: string; phone: string; email: string } {
		const url = typeof site === 'string' ? site : site?.siteUrl;
		let name = typeof site === 'object' && site ? site.siteName : undefined;
		if (!name && typeof site === 'string') {
			try {
				const host = new URL(site).hostname.replace(/^www\./, '');
				name = host.split('.')[0];
			} catch {
				// fallback
			}
		}
		return {
			name: name || this.FALLBACK_SITE_NAME,
			url: (url || this.FALLBACK_SITE_URL).replace(/\/$/, ''),
			logo: (typeof site === 'object' && site?.logoUrl) || '/favicon.png',
			phone: (typeof site === 'object' && site?.phone) || '',
			email: (typeof site === 'object' && site?.email) || ''
		};
	}

	/**
	 * Generates Google Rich Snippet Product Schema (JSON-LD)
	 */
	static getProductJsonLd(product: ProductSeoData, site?: Partial<SiteConfig>): Record<string, any> {
		const s = this.resolveSite(site);
		const imageUrl = product.image
			? product.image.startsWith('http') ? product.image : `${s.url}${product.image}`
			: `${s.url}${this.DEFAULT_IMAGE}`;

		return {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.name,
			image: [imageUrl],
			description: product.description,
			sku: product.sku || product.slug,
			brand: {
				'@type': 'Brand',
				name: product.brandName || s.name
			},
			offers: {
				'@type': 'Offer',
				url: `${s.url}/products/${product.slug}`,
				priceCurrency: 'BDT',
				price: product.price,
				itemCondition: 'https://schema.org/NewCondition',
				availability:
					product.inStock !== false
						? 'https://schema.org/InStock'
						: 'https://schema.org/OutOfStock',
				seller: {
					'@type': 'Organization',
					name: s.name
				}
			},
			// Only real reviews may be declared: invented ratings break Google's structured data policy.
			...(product.ratingValue && product.reviewCount
				? {
						aggregateRating: {
							'@type': 'AggregateRating',
							ratingValue: product.ratingValue,
							reviewCount: product.reviewCount,
							bestRating: '5',
							worstRating: '1'
						}
					}
				: {})
		};
	}

	/**
	 * Generates Google Rich Snippet Product/Offer Schema for Landing Pages (JSON-LD)
	 */
	static getLandingPageJsonLd(lp: LandingPageSeoData, site?: Partial<SiteConfig>): Record<string, any> {
		const s = this.resolveSite(site);
		const imageUrl = lp.image
			? lp.image.startsWith('http') ? lp.image : `${s.url}${lp.image}`
			: `${s.url}${this.DEFAULT_IMAGE}`;

		return {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: lp.name,
			image: [imageUrl],
			description: lp.description || `${lp.name} - কিনুন বিশেষ অফার মূল্যে ${s.name} থেকে।`,
			sku: lp.sku || lp.slug,
			brand: {
				'@type': 'Brand',
				name: lp.brandName || s.name
			},
			offers: {
				'@type': 'Offer',
				url: `${s.url}/lp/${lp.slug}`,
				priceCurrency: 'BDT',
				price: lp.price ?? 0,
				itemCondition: 'https://schema.org/NewCondition',
				availability:
					lp.inStock !== false
						? 'https://schema.org/InStock'
						: 'https://schema.org/OutOfStock',
				seller: {
					'@type': 'Organization',
					name: s.name
				}
			}
		};
	}

	/**
	 * Generates BreadcrumbList Schema (JSON-LD)
	 */
	static getBreadcrumbsJsonLd(breadcrumbs: BreadcrumbItem[], site?: Partial<SiteConfig>): Record<string, any> {
		const s = this.resolveSite(site);
		return {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbs.map((crumb, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: crumb.name,
				item: crumb.url.startsWith('http') ? crumb.url : `${s.url}${crumb.url}`
			}))
		};
	}

	/**
	 * Generates Website & Search Action Schema (JSON-LD)
	 */
	static getWebSiteJsonLd(site?: Partial<SiteConfig>): Record<string, any> {
		const s = this.resolveSite(site);
		return {
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: s.name,
			url: s.url,
			potentialAction: {
				'@type': 'SearchAction',
				target: `${s.url}/catalog?search={search_term_string}`,
				'query-input': 'required name=search_term_string'
			}
		};
	}

	/**
	 * Generates Organization Schema
	 */
	static getOrganizationJsonLd(site?: Partial<SiteConfig>): Record<string, any> {
		const s = this.resolveSite(site);
		return {
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: s.name,
			url: s.url,
			logo: s.logo.startsWith('http') ? s.logo : `${s.url}${s.logo}`,
			...(s.phone ? {
				contactPoint: {
					'@type': 'ContactPoint',
					telephone: s.phone,
					contactType: 'Customer Support',
					areaServed: 'BD',
					availableLanguage: ['Bengali', 'English']
				}
			} : {})
		};
	}
}
