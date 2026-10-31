import { eq, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface StoreDeliveryConfig {
	insideDhakaCharge: number;
	outsideDhakaCharge: number;
	freeShippingThreshold: number;
	hotlinePhone: string;
	storeName: string;
}

export interface WebsiteInfoConfig {
	websiteName: string;
	shortDescription: string;
	whatsappNumber: string;
	addresses: string[];
	emails: string[];
	logoUrl: string;
	faviconUrl: string;
}

export const DEFAULT_WEBSITE_INFO: WebsiteInfoConfig = {
	websiteName: 'AURA Store',
	shortDescription: 'The Premier Online Shopping Destination in Bangladesh. Premium products delivered to your doorstep.',
	whatsappNumber: '+8801860229546',
	addresses: ['Nawabpur Kaptan Bazar Complex Dhaka, Bangladesh'],
	emails: ['support@aura.com.bd'],
	logoUrl: '/favicon.svg',
	faviconUrl: '/favicon.svg'
};

export interface PaymentConfig {
	enableCOD: boolean;
	enableBkash: boolean;
	bkashMode: 'sandbox' | 'live';
	bkashAppKey: string;
	bkashAppSecret: string;
	bkashUsername: string;
	bkashPassword: string;
	enableNagad: boolean;
	nagadMerchantId: string;
	enableSSLCommerz: boolean;
	sslStoreId: string;
}

export interface ProductSettingsConfig {
	productType: 'physical' | 'digital';
	enableSoldQtySort: boolean;
	enablePrioritySort: boolean;
	enableMultipleCategory: boolean;
	enableTotalSold: boolean;
	enableDecimalPrice: boolean;
	enable3Variation: boolean;
	enableFaq: boolean;
	enableProductHighlights: boolean;
	enableFeaturesBadge: boolean;
	enableTrustBadges: boolean;
	enableCondition: boolean;
	detailsViewBottom: boolean;
	modelInput: boolean;
	keyFeatureOption: boolean;
	callOrderBtn: boolean;
	whatsappOrderBtn: boolean;
	testimonial: boolean;
	preOrder: boolean;
	resellMenu: boolean;
	portfolioMenu: boolean;
	under99Menu: boolean;
	userNotification: boolean;
	enableDeliveryCharge: boolean;
	enableAdvancePayment: boolean;
	checkoutLayout: 'express' | 'multistep';
	enableAdvancedSeo: boolean;
	categoryUrlFormat: 'query' | 'path';
	enableCampaign: boolean;
	enableReservation: boolean;
	enableInventory: boolean;
	managePhysicalStock: boolean;
}

export const DEFAULT_PRODUCT_SETTINGS: ProductSettingsConfig = {
	productType: 'physical',
	enableSoldQtySort: false,
	enablePrioritySort: false,
	enableMultipleCategory: true,
	enableTotalSold: false,
	enableDecimalPrice: true,
	enable3Variation: true,
	enableFaq: false,
	enableProductHighlights: false,
	enableFeaturesBadge: false,
	enableTrustBadges: false,
	enableCondition: true,
	detailsViewBottom: true,
	modelInput: false,
	keyFeatureOption: false,
	callOrderBtn: true,
	whatsappOrderBtn: false,
	testimonial: true,
	preOrder: true,
	resellMenu: false,
	portfolioMenu: false,
	under99Menu: false,
	userNotification: true,
	enableDeliveryCharge: true,
	enableAdvancePayment: false,
	checkoutLayout: 'express',
	enableAdvancedSeo: false,
	categoryUrlFormat: 'query',
	enableCampaign: false,
	enableReservation: false,
	enableInventory: false,
	managePhysicalStock: false
};

/**
 * Enterprise Store Settings Service
 * Backs all admin configuration modules
 */
export class SettingsService {
	/**
	 * Retrieves all key-value settings for a given group
	 */
	static async getSettingsGroup(
		db: DrizzleD1Database<typeof schema>,
		group: string
	): Promise<Record<string, any>> {
		const rows = await db
			.select()
			.from(schema.storeSettings)
			.where(eq(schema.storeSettings.group, group))
			.all();

		const result: Record<string, any> = {};
		for (const row of rows) {
			try {
				result[row.key] = JSON.parse(row.value);
			} catch {
				result[row.key] = row.value;
			}
		}

		return result;
	}

	/**
	 * Upserts a single key-value setting
	 */
	static async setSetting(
		db: DrizzleD1Database<typeof schema>,
		group: string,
		key: string,
		value: any
	) {
		const strValue = typeof value === 'string' ? value : JSON.stringify(value);

		await db
			.insert(schema.storeSettings)
			.values({
				group,
				key,
				value: strValue,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: [schema.storeSettings.group, schema.storeSettings.key],
				set: {
					value: strValue,
					updatedAt: new Date()
				}
			});

		return { success: true };
	}

	/**
	 * Resolves active delivery and store configuration with sensible defaults
	 */
	static async getStoreDeliveryConfig(
		db: DrizzleD1Database<typeof schema>
	): Promise<StoreDeliveryConfig> {
		try {
			const deliverySettings = await this.getSettingsGroup(db, 'delivery');
			return {
				insideDhakaCharge: Number(deliverySettings.inside_dhaka_charge) || 60,
				outsideDhakaCharge: Number(deliverySettings.outside_dhaka_charge) || 120,
				freeShippingThreshold: Number(deliverySettings.free_shipping_threshold) || 600,
				hotlinePhone: String(deliverySettings.hotline_phone || '01860-229546'),
				storeName: String(deliverySettings.store_name || 'AURA Store')
			};
		} catch (e) {
			return {
				insideDhakaCharge: 60,
				outsideDhakaCharge: 120,
				freeShippingThreshold: 600,
				hotlinePhone: '01860-229546',
				storeName: 'AURA Store'
			};
		}
	}

	/**
	 * Resolves active payment gateway configuration
	 * Defaults: COD only (enableCOD: true, enableBkash: false, enableNagad: false)
	 */
	static async getPaymentConfig(
		db: DrizzleD1Database<typeof schema>
	): Promise<PaymentConfig> {
		try {
			const s = await this.getSettingsGroup(db, 'payment');
			return {
				enableCOD: s.enable_cod !== false,
				enableBkash: Boolean(s.enable_bkash),
				bkashMode: (s.bkash_mode === 'live' ? 'live' : 'sandbox') as 'sandbox' | 'live',
				bkashAppKey: String(s.bkash_app_key || ''),
				bkashAppSecret: String(s.bkash_app_secret || ''),
				bkashUsername: String(s.bkash_username || ''),
				bkashPassword: String(s.bkash_password || ''),
				enableNagad: Boolean(s.enable_nagad),
				nagadMerchantId: String(s.nagad_merchant_id || ''),
				enableSSLCommerz: Boolean(s.enable_sslcommerz),
				sslStoreId: String(s.ssl_store_id || '')
			};
		} catch (e) {
			return {
				enableCOD: true,
				enableBkash: false,
				bkashMode: 'sandbox',
				bkashAppKey: '',
				bkashAppSecret: '',
				bkashUsername: '',
				bkashPassword: '',
				enableNagad: false,
				nagadMerchantId: '',
				enableSSLCommerz: false,
				sslStoreId: ''
			};
		}
	}

	/**
	 * Persists payment gateway settings
	 */
	static async savePaymentConfig(
		db: DrizzleD1Database<typeof schema>,
		config: Partial<PaymentConfig>
	) {
		const entries = [
			['enable_cod', config.enableCOD !== false],
			['enable_bkash', Boolean(config.enableBkash)],
			['bkash_mode', config.bkashMode === 'live' ? 'live' : 'sandbox'],
			['bkash_app_key', config.bkashAppKey || ''],
			['bkash_app_secret', config.bkashAppSecret || ''],
			['bkash_username', config.bkashUsername || ''],
			['bkash_password', config.bkashPassword || ''],
			['enable_nagad', Boolean(config.enableNagad)],
			['nagad_merchant_id', config.nagadMerchantId || ''],
			['enable_sslcommerz', Boolean(config.enableSSLCommerz)],
			['ssl_store_id', config.sslStoreId || '']
		];

		for (const [key, val] of entries) {
			await this.setSetting(db, 'payment', key as string, val);
		}

		return { success: true };
	}

	/**
	 * Retrieves website information configuration from D1
	 */
	static async getWebsiteInfo(
		db: DrizzleD1Database<typeof schema>
	): Promise<WebsiteInfoConfig> {
		try {
			const s = await this.getSettingsGroup(db, 'customization');
			if (!s || !s.website_info) {
				return DEFAULT_WEBSITE_INFO;
			}
			const parsed = typeof s.website_info === 'string' ? JSON.parse(s.website_info) : s.website_info;
			return {
				...DEFAULT_WEBSITE_INFO,
				...parsed,
				addresses: Array.isArray(parsed.addresses) && parsed.addresses.length > 0
					? parsed.addresses
					: DEFAULT_WEBSITE_INFO.addresses,
				emails: Array.isArray(parsed.emails) && parsed.emails.length > 0
					? parsed.emails
					: DEFAULT_WEBSITE_INFO.emails
			};
		} catch (e) {
			console.error('Failed to get website info:', e);
			return DEFAULT_WEBSITE_INFO;
		}
	}

	/**
	 * Saves website information configuration to D1 and syncs storefront defaults
	 */
	static async saveWebsiteInfo(
		db: DrizzleD1Database<typeof schema>,
		config: Partial<WebsiteInfoConfig>
	) {
		const current = await this.getWebsiteInfo(db);
		const merged: WebsiteInfoConfig = {
			...current,
			...config,
			addresses: Array.isArray(config.addresses)
				? config.addresses.filter((a) => Boolean(a.trim()))
				: current.addresses,
			emails: Array.isArray(config.emails)
				? config.emails.filter((e) => Boolean(e.trim()))
				: current.emails
		};

		await this.setSetting(db, 'customization', 'website_info', merged);

		// Synchronize store_name and hotline_phone in delivery settings as well
		if (merged.websiteName) {
			await this.setSetting(db, 'delivery', 'store_name', merged.websiteName);
		}
		if (merged.whatsappNumber) {
			await this.setSetting(db, 'delivery', 'hotline_phone', merged.whatsappNumber);
		}

		return { success: true, websiteInfo: merged };
	}

	/**
	 * Retrieves complete Product Settings configuration from D1
	 */
	static async getProductSettings(
		db: DrizzleD1Database<typeof schema>
	): Promise<ProductSettingsConfig> {
		try {
			const s = await this.getSettingsGroup(db, 'product');
			return {
				productType: s.product_type === 'digital' ? 'digital' : 'physical',
				enableSoldQtySort: Boolean(s.enable_sold_qty_sort),
				enablePrioritySort: Boolean(s.enable_priority_sort),
				enableMultipleCategory: s.enable_multiple_category !== undefined ? Boolean(s.enable_multiple_category) : true,
				enableTotalSold: Boolean(s.enable_total_sold),
				enableDecimalPrice: s.enable_decimal_price !== undefined ? Boolean(s.enable_decimal_price) : true,
				enable3Variation: s.enable_3_variation !== undefined ? Boolean(s.enable_3_variation) : true,
				enableFaq: Boolean(s.enable_faq),
				enableProductHighlights: Boolean(s.enable_product_highlights),
				enableFeaturesBadge: Boolean(s.enable_features_badge),
				enableTrustBadges: Boolean(s.enable_trust_badges),
				enableCondition: s.enable_condition !== undefined ? Boolean(s.enable_condition) : true,
				detailsViewBottom: s.details_view_bottom !== undefined ? Boolean(s.details_view_bottom) : true,
				modelInput: Boolean(s.model_input),
				keyFeatureOption: Boolean(s.key_feature_option),
				callOrderBtn: s.call_order_btn !== undefined ? Boolean(s.call_order_btn) : true,
				whatsappOrderBtn: Boolean(s.whatsapp_order_btn),
				testimonial: s.testimonial !== undefined ? Boolean(s.testimonial) : true,
				preOrder: s.pre_order !== undefined ? Boolean(s.pre_order) : true,
				resellMenu: Boolean(s.resell_menu),
				portfolioMenu: Boolean(s.portfolio_menu),
				under99Menu: Boolean(s.under99_menu),
				userNotification: s.user_notification !== undefined ? Boolean(s.user_notification) : true,
				enableDeliveryCharge: s.enable_delivery_charge !== undefined ? Boolean(s.enable_delivery_charge) : true,
				enableAdvancePayment: Boolean(s.enable_advance_payment),
				checkoutLayout: s.checkout_layout === 'multistep' ? 'multistep' : 'express',
				enableAdvancedSeo: Boolean(s.enable_advanced_seo),
				categoryUrlFormat: s.category_url_format === 'path' ? 'path' : 'query',
				enableCampaign: Boolean(s.enable_campaign),
				enableReservation: Boolean(s.enable_reservation),
				enableInventory: Boolean(s.enable_inventory),
				managePhysicalStock: Boolean(s.manage_physical_stock)
			};
		} catch (e) {
			console.error('Failed to get product settings:', e);
			return { ...DEFAULT_PRODUCT_SETTINGS };
		}
	}

	/**
	 * Persists complete Product Settings configuration into D1
	 */
	static async saveProductSettings(
		db: DrizzleD1Database<typeof schema>,
		config: Partial<ProductSettingsConfig>
	) {
		const mapping: [string, any][] = [
			['product_type', config.productType || 'physical'],
			['enable_sold_qty_sort', Boolean(config.enableSoldQtySort)],
			['enable_priority_sort', Boolean(config.enablePrioritySort)],
			['enable_multiple_category', config.enableMultipleCategory !== undefined ? Boolean(config.enableMultipleCategory) : true],
			['enable_total_sold', Boolean(config.enableTotalSold)],
			['enable_decimal_price', config.enableDecimalPrice !== undefined ? Boolean(config.enableDecimalPrice) : true],
			['enable_3_variation', config.enable3Variation !== undefined ? Boolean(config.enable3Variation) : true],
			['enable_faq', Boolean(config.enableFaq)],
			['enable_product_highlights', Boolean(config.enableProductHighlights)],
			['enable_features_badge', Boolean(config.enableFeaturesBadge)],
			['enable_trust_badges', Boolean(config.enableTrustBadges)],
			['enable_condition', config.enableCondition !== undefined ? Boolean(config.enableCondition) : true],
			['details_view_bottom', config.detailsViewBottom !== undefined ? Boolean(config.detailsViewBottom) : true],
			['model_input', Boolean(config.modelInput)],
			['key_feature_option', Boolean(config.keyFeatureOption)],
			['call_order_btn', config.callOrderBtn !== undefined ? Boolean(config.callOrderBtn) : true],
			['whatsapp_order_btn', Boolean(config.whatsappOrderBtn)],
			['testimonial', config.testimonial !== undefined ? Boolean(config.testimonial) : true],
			['pre_order', config.preOrder !== undefined ? Boolean(config.preOrder) : true],
			['resell_menu', Boolean(config.resellMenu)],
			['portfolio_menu', Boolean(config.portfolioMenu)],
			['under99_menu', Boolean(config.under99Menu)],
			['user_notification', config.userNotification !== undefined ? Boolean(config.userNotification) : true],
			['enable_delivery_charge', config.enableDeliveryCharge !== undefined ? Boolean(config.enableDeliveryCharge) : true],
			['enable_advance_payment', Boolean(config.enableAdvancePayment)],
			['checkout_layout', config.checkoutLayout === 'multistep' ? 'multistep' : 'express'],
			['enable_advanced_seo', Boolean(config.enableAdvancedSeo)],
			['category_url_format', config.categoryUrlFormat === 'path' ? 'path' : 'query'],
			['enable_campaign', Boolean(config.enableCampaign)],
			['enable_reservation', Boolean(config.enableReservation)],
			['enable_inventory', Boolean(config.enableInventory)],
			['manage_physical_stock', Boolean(config.managePhysicalStock)]
		];

		for (const [key, val] of mapping) {
			await this.setSetting(db, 'product', key, val);
		}

		return { success: true };
	}
}

