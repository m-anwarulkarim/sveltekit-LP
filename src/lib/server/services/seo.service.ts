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
	static readonly SITE_NAME = 'seedbd';
	static readonly DEFAULT_SITE_URL = 'https://seedbd.shop';
	static readonly DEFAULT_IMAGE = '/apple-touch-icon.png';

	/**
	 * Normalizes base site URL
	 */
	static getSiteUrl(siteUrl?: string): string {
		return (siteUrl || this.DEFAULT_SITE_URL).replace(/\/$/, '');
	}

	/**
	 * Generates Google Rich Snippet Product Schema (JSON-LD)
	 */
	static getProductJsonLd(product: ProductSeoData, siteUrl?: string): Record<string, any> {
		const base = this.getSiteUrl(siteUrl);
		const imageUrl = product.image
			? product.image.startsWith('http') ? product.image : `${base}${product.image}`
			: `${base}${this.DEFAULT_IMAGE}`;

		return {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.name,
			image: [imageUrl],
			description: product.description,
			sku: product.sku || product.slug,
			brand: {
				'@type': 'Brand',
				name: product.brandName || this.SITE_NAME
			},
			offers: {
				'@type': 'Offer',
				url: `${base}/products/${product.slug}`,
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
	static getLandingPageJsonLd(lp: LandingPageSeoData, siteUrl?: string): Record<string, any> {
		const base = this.getSiteUrl(siteUrl);
		const imageUrl = lp.image
			? lp.image.startsWith('http') ? lp.image : `${base}${lp.image}`
			: `${base}${this.DEFAULT_IMAGE}`;

		return {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: lp.name,
			image: [imageUrl],
			description: lp.description || `${lp.name} - কিনুন বিশেষ অফার মূল্যে ${this.SITE_NAME} থেকে।`,
			sku: lp.sku || lp.slug,
			brand: {
				'@type': 'Brand',
				name: lp.brandName || this.SITE_NAME
			},
			offers: {
				'@type': 'Offer',
				url: `${base}/lp/${lp.slug}`,
				priceCurrency: 'BDT',
				price: lp.price ?? 0,
				itemCondition: 'https://schema.org/NewCondition',
				availability:
					lp.inStock !== false
						? 'https://schema.org/InStock'
						: 'https://schema.org/OutOfStock',
				seller: {
					'@type': 'Organization',
					name: this.SITE_NAME
				}
			}
		};
	}

	/**
	 * Generates BreadcrumbList Schema (JSON-LD)
	 */
	static getBreadcrumbsJsonLd(breadcrumbs: BreadcrumbItem[], siteUrl?: string): Record<string, any> {
		const base = this.getSiteUrl(siteUrl);
		return {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbs.map((crumb, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: crumb.name,
				item: crumb.url.startsWith('http') ? crumb.url : `${base}${crumb.url}`
			}))
		};
	}

	/**
	 * Generates Website & Search Action Schema (JSON-LD)
	 */
	static getWebSiteJsonLd(siteUrl?: string): Record<string, any> {
		const base = this.getSiteUrl(siteUrl);
		return {
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: this.SITE_NAME,
			url: base,
			potentialAction: {
				'@type': 'SearchAction',
				target: `${base}/catalog?search={search_term_string}`,
				'query-input': 'required name=search_term_string'
			}
		};
	}

	/**
	 * Generates Organization Schema
	 */
	static getOrganizationJsonLd(siteUrl?: string): Record<string, any> {
		const base = this.getSiteUrl(siteUrl);
		return {
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: this.SITE_NAME,
			url: base,
			logo: `${base}/favicon.png`,
			contactPoint: {
				'@type': 'ContactPoint',
				telephone: '+8800156007230',
				contactType: 'Customer Support',
				areaServed: 'BD',
				availableLanguage: ['Bengali', 'English']
			}
		};
	}
}

