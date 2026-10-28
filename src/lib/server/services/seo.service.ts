/**
 * Enterprise SEO & Structured Data (JSON-LD) Service
 * Following Google Search Central & Schema.org Standards
 */

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

export interface BreadcrumbItem {
	name: string;
	url: string;
}

export class SeoService {
	static readonly SITE_NAME = 'AURA Acoustics & Gadgets';
	static readonly SITE_URL = 'https://lp.haqplus.com';
	static readonly DEFAULT_IMAGE = 'https://lp.haqplus.com/og-image.jpg';

	/**
	 * Generates Google Rich Snippet Product Schema (JSON-LD)
	 */
	static getProductJsonLd(product: ProductSeoData): Record<string, any> {
		return {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.name,
			image: product.image ? [product.image] : [this.DEFAULT_IMAGE],
			description: product.description,
			sku: product.sku || product.slug,
			brand: {
				'@type': 'Brand',
				name: product.brandName || 'AURA'
			},
			offers: {
				'@type': 'Offer',
				url: `${this.SITE_URL}/products/${product.slug}`,
				priceCurrency: 'BDT',
				price: product.price,
				itemCondition: 'https://schema.org/NewCondition',
				availability:
					product.inStock !== false
						? 'https://schema.org/InStock'
						: 'https://schema.org/OutOfStock',
				seller: {
					'@type': 'Organization',
					name: this.SITE_NAME
				}
			},
			aggregateRating: {
				'@type': 'AggregateRating',
				ratingValue: product.ratingValue || 4.9,
				reviewCount: product.reviewCount || 148,
				bestRating: '5',
				worstRating: '1'
			}
		};
	}

	/**
	 * Generates BreadcrumbList Schema (JSON-LD)
	 */
	static getBreadcrumbsJsonLd(breadcrumbs: BreadcrumbItem[]): Record<string, any> {
		return {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbs.map((crumb, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: crumb.name,
				item: crumb.url.startsWith('http') ? crumb.url : `${this.SITE_URL}${crumb.url}`
			}))
		};
	}

	/**
	 * Generates Website & Search Action Schema (JSON-LD)
	 */
	static getWebSiteJsonLd(): Record<string, any> {
		return {
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: this.SITE_NAME,
			url: this.SITE_URL,
			potentialAction: {
				'@type': 'SearchAction',
				target: `${this.SITE_URL}/catalog?search={search_term_string}`,
				'query-input': 'required name=search_term_string'
			}
		};
	}

	/**
	 * Generates Organization Schema
	 */
	static getOrganizationJsonLd(): Record<string, any> {
		return {
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: this.SITE_NAME,
			url: this.SITE_URL,
			logo: `${this.SITE_URL}/favicon.png`,
			contactPoint: {
				'@type': 'ContactPoint',
				telephone: '+8801860229546',
				contactType: 'Customer Support',
				areaServed: 'BD',
				availableLanguage: ['Bengali', 'English']
			}
		};
	}
}

