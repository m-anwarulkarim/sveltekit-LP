import { eq, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface StoreDeliveryConfig {
	insideDhakaCharge: number;
	outsideDhakaCharge: number;
	subAreaCharge?: number;
	enableFreeDelivery?: boolean;
	freeShippingThreshold: number;
	hotlinePhone: string;
	storeName: string;
}

export interface ManageOfferItem {
	id: string;
	offerType: 'New Registration' | 'Online Payment' | 'Free Delivery (1st Order)';
	discount: string;
	status: 'active' | 'inactive';
	createdAt?: string;
}

export interface RewardPointConfig {
	isEnabled: boolean;
	pointsThreshold: number;
	currencyValue: number;
	calcMethod: 'manual' | 'percentage';
}

export interface GoogleConsoleConfig {
	verificationToken: string;
}

export const DEFAULT_GOOGLE_CONSOLE_CONFIG: GoogleConsoleConfig = {
	verificationToken: ''
};

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

export interface SocialLoginConfig {
	enableGoogleLogin: boolean;
	googleClientId: string;
	googleClientSecret: string;
	enableOneTap: boolean;
}

export const DEFAULT_SOCIAL_LOGIN_CONFIG: SocialLoginConfig = {
	enableGoogleLogin: false,
	googleClientId: '',
	googleClientSecret: '',
	enableOneTap: false
};

export interface InvoiceConfig {
	template: string;
	disablePrice: boolean;
	enableCourier: boolean;
	enableReturnPolicy: boolean;
}

export const DEFAULT_INVOICE_CONFIG: InvoiceConfig = {
	template: 'classicDesign',
	disablePrice: false,
	enableCourier: true,
	enableReturnPolicy: true
};

export interface OrderSettingsConfig {
	enableOrderNote: boolean;
	enableIncompleteOrder: boolean;
	enablePrescriptionOrder: boolean;
	enableCheckoutOrderModal: boolean;
	swapPaymentAndOrderItem: boolean;

	enableSL: boolean;
	enableProductSKU: boolean;
	enableProductName: boolean;
	enablePrevOrderCount: boolean;
	showDashboardProfitCard: boolean;
	enableHRM: boolean;

	fakeOrderProtection: boolean;
	enableOrderOTP: boolean;
	enablePhoneValidation: boolean;
	phoneMinLength: number;
	phoneMaxLength: number;
	blockSingleIP: boolean;
	ipWiseOrderLimit: boolean;

	enableSMSNotification: boolean;
	enableEmailNotification: boolean;
	usePersonalSMTP: boolean;

	deliveryBookingType: 'division' | 'city' | 'sub_area' | 'district';
	deliveryOptionTitle: string;
	insideDhakaCustomText: string;
	outsideDhakaCustomText: string;

	successTitle: string;
	successMessageBody: string;

	enableCustomStatusWorkflow: boolean;

	requireFullAddress: boolean;
	showDistrictDropdown: boolean;
}

export const DEFAULT_ORDER_SETTINGS: OrderSettingsConfig = {
	enableOrderNote: true,
	enableIncompleteOrder: true,
	enablePrescriptionOrder: false,
	enableCheckoutOrderModal: false,
	swapPaymentAndOrderItem: true,

	enableSL: true,
	enableProductSKU: true,
	enableProductName: true,
	enablePrevOrderCount: true,
	showDashboardProfitCard: true,
	enableHRM: false,

	fakeOrderProtection: true,
	enableOrderOTP: false,
	enablePhoneValidation: true,
	phoneMinLength: 11,
	phoneMaxLength: 11,
	blockSingleIP: false,
	ipWiseOrderLimit: false,

	enableSMSNotification: true,
	enableEmailNotification: true,
	usePersonalSMTP: false,

	deliveryBookingType: 'city',
	deliveryOptionTitle: 'শর্তাবলী: ১। অর্ডারকৃত পণ্য গ্রহণ করার সময় দেখে নিবেন',
	insideDhakaCustomText: 'Inside Dhaka 70TK',
	outsideDhakaCustomText: 'Outside Dhaka 120TK',

	successTitle: '',
	successMessageBody: '',

	enableCustomStatusWorkflow: false,

	requireFullAddress: true,
	showDistrictDropdown: true
};

export interface AdvancePaymentConfig {
	enableAdvancePayment: boolean;
	advanceType: 'fixed' | 'percentage';
	advanceAmount: number;
	onlyOutsideDhaka: boolean;
	autoCancelMinutes: number;
	bkashNumber: string;
	nagadNumber: string;
	rocketNumber?: string;
	instructions: string;
}

export const DEFAULT_ADVANCE_PAYMENT: AdvancePaymentConfig = {
	enableAdvancePayment: false,
	advanceType: 'fixed',
	advanceAmount: 0,
	onlyOutsideDhaka: false,
	autoCancelMinutes: 30,
	bkashNumber: '',
	nagadNumber: '',
	rocketNumber: '',
	instructions: 'অনুগ্রহ করে উল্লিখিত নাম্বারে সেন্ড মানি বা পেমেন্ট করে ট্রানজেকশন আইডি প্রদান করুন।'
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
	enableEmail?: boolean;
	isEmailOptional?: boolean;
	enableAddress?: boolean;
	enableDivision?: boolean;
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
	enableEmail: false,
	isEmailOptional: false,
	enableAddress: false,
	enableDivision: false,
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
			const insideDhaka =
				deliverySettings.inside_dhaka_charge !== undefined
					? Number(deliverySettings.inside_dhaka_charge)
					: 60;
			const outsideDhaka =
				deliverySettings.outside_dhaka_charge !== undefined
					? Number(deliverySettings.outside_dhaka_charge)
					: 120;
			const subArea =
				deliverySettings.sub_area_charge !== undefined
					? Number(deliverySettings.sub_area_charge)
					: 100;
			const enableFree =
				deliverySettings.enable_free_delivery === 'true' ||
				deliverySettings.enable_free_delivery === true;
			const threshold =
				deliverySettings.free_shipping_threshold !== undefined
					? Number(deliverySettings.free_shipping_threshold)
					: 2000;

			return {
				insideDhakaCharge: insideDhaka,
				outsideDhakaCharge: outsideDhaka,
				subAreaCharge: subArea,
				enableFreeDelivery: enableFree,
				freeShippingThreshold: threshold,
				hotlinePhone: String(deliverySettings.hotline_phone || '01860-229546'),
				storeName: String(deliverySettings.store_name || 'AURA Store')
			};
		} catch (e) {
			return {
				insideDhakaCharge: 60,
				outsideDhakaCharge: 120,
				subAreaCharge: 100,
				enableFreeDelivery: false,
				freeShippingThreshold: 2000,
				hotlinePhone: '01860-229546',
				storeName: 'AURA Store'
			};
		}
	}

	/**
	 * Persists delivery and shipping charge configuration to D1 store_settings
	 */
	static async saveStoreDeliveryConfig(
		db: DrizzleD1Database<typeof schema>,
		config: Partial<StoreDeliveryConfig>
	) {
		const entries: [string, any][] = [];

		if (config.insideDhakaCharge !== undefined) {
			entries.push(['inside_dhaka_charge', Number(config.insideDhakaCharge) || 0]);
		}
		if (config.outsideDhakaCharge !== undefined) {
			entries.push(['outside_dhaka_charge', Number(config.outsideDhakaCharge) || 0]);
		}
		if (config.subAreaCharge !== undefined) {
			entries.push(['sub_area_charge', Number(config.subAreaCharge) || 0]);
		}
		if (config.enableFreeDelivery !== undefined) {
			entries.push(['enable_free_delivery', Boolean(config.enableFreeDelivery)]);
		}
		if (config.freeShippingThreshold !== undefined) {
			entries.push(['free_shipping_threshold', Number(config.freeShippingThreshold) || 0]);
		}
		if (config.hotlinePhone) {
			entries.push(['hotline_phone', config.hotlinePhone]);
		}
		if (config.storeName) {
			entries.push(['store_name', config.storeName]);
		}

		for (const [key, val] of entries) {
			await this.setSetting(db, 'delivery', key, val);
		}

		return await this.getStoreDeliveryConfig(db);
	}

	/**
	 * Resolves behavioral offers configuration (New Registration, Online Payment, Free Delivery)
	 */
	static async getManageOffers(db: DrizzleD1Database<typeof schema>): Promise<ManageOfferItem[]> {
		try {
			const group = await this.getSettingsGroup(db, 'manage_offer');
			if (group.offers) {
				let parsed = typeof group.offers === 'string' ? JSON.parse(group.offers) : group.offers;
				if (typeof parsed === 'string') {
					try {
						parsed = JSON.parse(parsed);
					} catch {}
				}
				if (Array.isArray(parsed)) return parsed;
			}
			return [];
		} catch (e) {
			console.error('Failed to get manage offers from D1:', e);
			return [];
		}
	}

	/**
	 * Persists behavioral offers configuration to D1 store_settings
	 */
	static async saveManageOffers(
		db: DrizzleD1Database<typeof schema>,
		offers: ManageOfferItem[]
	) {
		await this.setSetting(db, 'manage_offer', 'offers', offers);
		return await this.getManageOffers(db);
	}

	/**
	 * Resolves reward points configuration from D1 store_settings
	 */
	static async getRewardPointConfig(
		db: DrizzleD1Database<typeof schema>
	): Promise<RewardPointConfig> {
		try {
			const group = await this.getSettingsGroup(db, 'reward_point');
			return {
				isEnabled:
					group.enable_reward_points !== undefined
						? group.enable_reward_points === 'true' || group.enable_reward_points === true
						: true,
				pointsThreshold: Number(group.points_threshold) || 100,
				currencyValue: Number(group.currency_value) || 10,
				calcMethod: group.calc_method === 'percentage' ? 'percentage' : 'manual'
			};
		} catch (e) {
			console.error('Failed to get reward point config from D1:', e);
			return {
				isEnabled: true,
				pointsThreshold: 100,
				currencyValue: 10,
				calcMethod: 'manual'
			};
		}
	}

	/**
	 * Persists reward points configuration to D1 store_settings
	 */
	static async saveRewardPointConfig(
		db: DrizzleD1Database<typeof schema>,
		config: Partial<RewardPointConfig>
	) {
		const entries: [string, any][] = [
			['enable_reward_points', Boolean(config.isEnabled)],
			['points_threshold', Number(config.pointsThreshold) || 100],
			['currency_value', Number(config.currencyValue) || 10],
			['calc_method', config.calcMethod || 'manual']
		];

		for (const [key, val] of entries) {
			await this.setSetting(db, 'reward_point', key, val);
		}

		return await this.getRewardPointConfig(db);
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
				enableEmail: Boolean(s.enable_email),
				isEmailOptional: Boolean(s.is_email_optional),
				enableAddress: Boolean(s.enable_address),
				enableDivision: Boolean(s.enable_division),
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
			['enable_email', Boolean(config.enableEmail)],
			['is_email_optional', Boolean(config.isEmailOptional)],
			['enable_address', Boolean(config.enableAddress)],
			['enable_division', Boolean(config.enableDivision)],
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

	/**
	 * Resolves active advance payment configuration
	 */
	static async getAdvancePaymentConfig(
		db: DrizzleD1Database<typeof schema>
	): Promise<AdvancePaymentConfig> {
		try {
			const s = await this.getSettingsGroup(db, 'advance_payment');
			return {
				enableAdvancePayment: Boolean(s.enable_advance_payment),
				advanceType: s.advance_type === 'percentage' ? 'percentage' : 'fixed',
				advanceAmount: Number(s.advance_amount) || 0,
				onlyOutsideDhaka: Boolean(s.only_outside_dhaka),
				autoCancelMinutes: Number(s.auto_cancel_minutes) || 30,
				bkashNumber: String(s.bkash_number || ''),
				nagadNumber: String(s.nagad_number || ''),
				rocketNumber: String(s.rocket_number || ''),
				instructions: String(
					s.instructions ||
						'অনুগ্রহ করে উল্লিখিত নাম্বারে সেন্ড মানি বা পেমেন্ট করে ট্রানজেকশন আইডি প্রদান করুন।'
				)
			};
		} catch (e) {
			console.error('Failed to get advance payment config:', e);
			return { ...DEFAULT_ADVANCE_PAYMENT };
		}
	}

	/**
	 * Persists complete Advance Payment configuration into D1
	 */
	static async saveAdvancePaymentConfig(
		db: DrizzleD1Database<typeof schema>,
		config: Partial<AdvancePaymentConfig>
	) {
		const mapping: [string, any][] = [
			['enable_advance_payment', Boolean(config.enableAdvancePayment)],
			['advance_type', config.advanceType === 'percentage' ? 'percentage' : 'fixed'],
			['advance_amount', Number(config.advanceAmount) || 0],
			['only_outside_dhaka', Boolean(config.onlyOutsideDhaka)],
			['auto_cancel_minutes', Number(config.autoCancelMinutes) || 30],
			['bkash_number', String(config.bkashNumber || '').trim()],
			['nagad_number', String(config.nagadNumber || '').trim()],
			['rocket_number', String(config.rocketNumber || '').trim()],
			['instructions', String(config.instructions || '').trim()]
		];

		for (const [key, val] of mapping) {
			await this.setSetting(db, 'advance_payment', key, val);
		}

		// Keep product group's enable_advance_payment in sync
		if (config.enableAdvancePayment !== undefined) {
			await this.setSetting(db, 'product', 'enable_advance_payment', Boolean(config.enableAdvancePayment));
		}

		return await this.getAdvancePaymentConfig(db);
	}

	/**
	 * Retrieves Social Login (Google) settings from D1
	 */
	static async getSocialLoginConfig(db: DrizzleD1Database<typeof schema>): Promise<SocialLoginConfig> {
		try {
			const s = await this.getSettingsGroup(db, 'social_login');
			return {
				enableGoogleLogin: Boolean(s.enable_google_login),
				googleClientId: String(s.google_client_id || ''),
				googleClientSecret: String(s.google_client_secret || ''),
				enableOneTap: Boolean(s.enable_one_tap)
			};
		} catch (e) {
			console.error('Failed to get social login config:', e);
			return { ...DEFAULT_SOCIAL_LOGIN_CONFIG };
		}
	}

	/**
	 * Persists Social Login (Google) configuration into D1
	 */
	static async saveSocialLoginConfig(
		db: DrizzleD1Database<typeof schema>,
		config: Partial<SocialLoginConfig>
	): Promise<SocialLoginConfig> {
		const mapping: [string, any][] = [
			['enable_google_login', Boolean(config.enableGoogleLogin)],
			['google_client_id', String(config.googleClientId || '').trim()],
			['google_client_secret', String(config.googleClientSecret || '').trim()],
			['enable_one_tap', Boolean(config.enableOneTap)]
		];

		for (const [key, val] of mapping) {
			await this.setSetting(db, 'social_login', key, val);
		}

		return await this.getSocialLoginConfig(db);
	}

	/**
	 * Retrieves complete Order Settings configuration from D1
	 */
	static async getOrderSettings(db: DrizzleD1Database<typeof schema>): Promise<OrderSettingsConfig> {
		try {
			const s = await this.getSettingsGroup(db, 'order_setting');
			if (!s || Object.keys(s).length === 0) {
				return { ...DEFAULT_ORDER_SETTINGS };
			}

			return {
				enableOrderNote:
					s.enable_order_note !== undefined
						? Boolean(s.enable_order_note)
						: DEFAULT_ORDER_SETTINGS.enableOrderNote,
				enableIncompleteOrder:
					s.enable_incomplete_order !== undefined
						? Boolean(s.enable_incomplete_order)
						: DEFAULT_ORDER_SETTINGS.enableIncompleteOrder,
				enablePrescriptionOrder: Boolean(s.enable_prescription_order),
				enableCheckoutOrderModal: Boolean(s.enable_checkout_order_modal),
				swapPaymentAndOrderItem:
					s.swap_payment_and_order_item !== undefined
						? Boolean(s.swap_payment_and_order_item)
						: DEFAULT_ORDER_SETTINGS.swapPaymentAndOrderItem,

				enableSL:
					s.enable_sl !== undefined ? Boolean(s.enable_sl) : DEFAULT_ORDER_SETTINGS.enableSL,
				enableProductSKU:
					s.enable_product_sku !== undefined
						? Boolean(s.enable_product_sku)
						: DEFAULT_ORDER_SETTINGS.enableProductSKU,
				enableProductName:
					s.enable_product_name !== undefined
						? Boolean(s.enable_product_name)
						: DEFAULT_ORDER_SETTINGS.enableProductName,
				enablePrevOrderCount:
					s.enable_prev_order_count !== undefined
						? Boolean(s.enable_prev_order_count)
						: DEFAULT_ORDER_SETTINGS.enablePrevOrderCount,
				showDashboardProfitCard:
					s.show_dashboard_profit_card !== undefined
						? Boolean(s.show_dashboard_profit_card)
						: DEFAULT_ORDER_SETTINGS.showDashboardProfitCard,
				enableHRM: Boolean(s.enable_hrm),

				fakeOrderProtection:
					s.fake_order_protection !== undefined
						? Boolean(s.fake_order_protection)
						: DEFAULT_ORDER_SETTINGS.fakeOrderProtection,
				enableOrderOTP: Boolean(s.enable_order_otp),
				enablePhoneValidation:
					s.enable_phone_validation !== undefined
						? Boolean(s.enable_phone_validation)
						: DEFAULT_ORDER_SETTINGS.enablePhoneValidation,
				phoneMinLength: Number(s.phone_min_length) || DEFAULT_ORDER_SETTINGS.phoneMinLength,
				phoneMaxLength: Number(s.phone_max_length) || DEFAULT_ORDER_SETTINGS.phoneMaxLength,
				blockSingleIP: Boolean(s.block_single_ip),
				ipWiseOrderLimit: Boolean(s.ip_wise_order_limit),

				enableSMSNotification:
					s.enable_sms_notification !== undefined
						? Boolean(s.enable_sms_notification)
						: DEFAULT_ORDER_SETTINGS.enableSMSNotification,
				enableEmailNotification:
					s.enable_email_notification !== undefined
						? Boolean(s.enable_email_notification)
						: DEFAULT_ORDER_SETTINGS.enableEmailNotification,
				usePersonalSMTP: Boolean(s.use_personal_smtp),

				deliveryBookingType: ['division', 'city', 'sub_area', 'district'].includes(
					s.delivery_booking_type
				)
					? s.delivery_booking_type
					: 'city',
				deliveryOptionTitle: String(
					s.delivery_option_title || DEFAULT_ORDER_SETTINGS.deliveryOptionTitle
				),
				insideDhakaCustomText: String(
					s.inside_dhaka_custom_text || DEFAULT_ORDER_SETTINGS.insideDhakaCustomText
				),
				outsideDhakaCustomText: String(
					s.outside_dhaka_custom_text || DEFAULT_ORDER_SETTINGS.outsideDhakaCustomText
				),

				successTitle: String(s.success_title || DEFAULT_ORDER_SETTINGS.successTitle),
				successMessageBody: String(
					s.success_message_body || DEFAULT_ORDER_SETTINGS.successMessageBody
				),

				enableCustomStatusWorkflow: Boolean(s.enable_custom_status_workflow),

				requireFullAddress:
					s.require_full_address !== undefined
						? Boolean(s.require_full_address)
						: DEFAULT_ORDER_SETTINGS.requireFullAddress,
				showDistrictDropdown:
					s.show_district_dropdown !== undefined
						? Boolean(s.show_district_dropdown)
						: DEFAULT_ORDER_SETTINGS.showDistrictDropdown
			};
		} catch (e) {
			console.error('Failed to get order settings:', e);
			return { ...DEFAULT_ORDER_SETTINGS };
		}
	}

	/**
	 * Persists complete Order Settings configuration into D1
	 */
	static async saveOrderSettings(
		db: DrizzleD1Database<typeof schema>,
		config: Partial<OrderSettingsConfig>
	): Promise<OrderSettingsConfig> {
		const mapping: [string, any][] = [
			['enable_order_note', Boolean(config.enableOrderNote)],
			['enable_incomplete_order', Boolean(config.enableIncompleteOrder)],
			['enable_prescription_order', Boolean(config.enablePrescriptionOrder)],
			['enable_checkout_order_modal', Boolean(config.enableCheckoutOrderModal)],
			['swap_payment_and_order_item', Boolean(config.swapPaymentAndOrderItem)],

			['enable_sl', Boolean(config.enableSL)],
			['enable_product_sku', Boolean(config.enableProductSKU)],
			['enable_product_name', Boolean(config.enableProductName)],
			['enable_prev_order_count', Boolean(config.enablePrevOrderCount)],
			['show_dashboard_profit_card', Boolean(config.showDashboardProfitCard)],
			['enable_hrm', Boolean(config.enableHRM)],

			['fake_order_protection', Boolean(config.fakeOrderProtection)],
			['enable_order_otp', Boolean(config.enableOrderOTP)],
			['enable_phone_validation', Boolean(config.enablePhoneValidation)],
			['phone_min_length', Number(config.phoneMinLength) || 11],
			['phone_max_length', Number(config.phoneMaxLength) || 11],
			['block_single_ip', Boolean(config.blockSingleIP)],
			['ip_wise_order_limit', Boolean(config.ipWiseOrderLimit)],

			['enable_sms_notification', Boolean(config.enableSMSNotification)],
			['enable_email_notification', Boolean(config.enableEmailNotification)],
			['use_personal_smtp', Boolean(config.usePersonalSMTP)],

			['delivery_booking_type', config.deliveryBookingType || 'city'],
			['delivery_option_title', String(config.deliveryOptionTitle ?? '').trim()],
			['inside_dhaka_custom_text', String(config.insideDhakaCustomText ?? '').trim()],
			['outside_dhaka_custom_text', String(config.outsideDhakaCustomText ?? '').trim()],

			['success_title', String(config.successTitle ?? '').trim()],
			['success_message_body', String(config.successMessageBody ?? '').trim()],

			['enable_custom_status_workflow', Boolean(config.enableCustomStatusWorkflow)],

			['require_full_address', Boolean(config.requireFullAddress)],
			['show_district_dropdown', Boolean(config.showDistrictDropdown)]
		];

		for (const [key, val] of mapping) {
			await this.setSetting(db, 'order_setting', key, val);
		}

		return await this.getOrderSettings(db);
	}

	/**
	 * Resolves active invoice template & printing settings
	 */
	static async getInvoiceConfig(
		db: DrizzleD1Database<typeof schema>
	): Promise<InvoiceConfig> {
		try {
			const s = await this.getSettingsGroup(db, 'invoice');
			return {
				template: String(s.template || 'classicDesign'),
				disablePrice: Boolean(s.disable_price),
				enableCourier: s.enable_courier !== undefined ? Boolean(s.enable_courier) : true,
				enableReturnPolicy: s.enable_return_policy !== undefined ? Boolean(s.enable_return_policy) : true
			};
		} catch (e) {
			console.error('Failed to get invoice config from D1:', e);
			return { ...DEFAULT_INVOICE_CONFIG };
		}
	}

	/**
	 * Persists complete invoice template & printing configuration into D1
	 */
	static async saveInvoiceConfig(
		db: DrizzleD1Database<typeof schema>,
		config: Partial<InvoiceConfig>
	) {
		const mapping: [string, any][] = [
			['template', String(config.template || 'classicDesign')],
			['disable_price', Boolean(config.disablePrice)],
			['enable_courier', config.enableCourier !== undefined ? Boolean(config.enableCourier) : true],
			['enable_return_policy', config.enableReturnPolicy !== undefined ? Boolean(config.enableReturnPolicy) : true]
		];

		for (const [key, val] of mapping) {
			await this.setSetting(db, 'invoice', key, val);
		}

		return await this.getInvoiceConfig(db);
	}

	/**
	 * Retrieves Google Search Console verification token from D1 store_settings
	 */
	static async getGoogleConsoleConfig(
		db: DrizzleD1Database<typeof schema>
	): Promise<GoogleConsoleConfig> {
		try {
			const group = await this.getSettingsGroup(db, 'google_console');
			return {
				verificationToken: String(group.verification_token ?? group.token ?? '').trim()
			};
		} catch (e) {
			console.error('Failed to get google console config from D1:', e);
			return { ...DEFAULT_GOOGLE_CONSOLE_CONFIG };
		}
	}

	/**
	 * Persists Google Search Console configuration to D1 store_settings.
	 * Cleans and sanitizes inputs if user pastes full meta tag code.
	 */
	static async saveGoogleConsoleConfig(
		db: DrizzleD1Database<typeof schema>,
		token: string
	): Promise<GoogleConsoleConfig> {
		let cleanToken = String(token ?? '').trim();
		// Extract verification token if pasted as full meta HTML tag
		const contentMatch = cleanToken.match(/content=["']([^"']+)["']/i);
		if (contentMatch && contentMatch[1]) {
			cleanToken = contentMatch[1].trim();
		} else {
			// Strip tag wrappers or stray quotes if present
			cleanToken = cleanToken.replace(/^<meta[^>]*>/i, '').replace(/["']/g, '').trim();
		}

		await this.setSetting(db, 'google_console', 'verification_token', cleanToken);
		return await this.getGoogleConsoleConfig(db);
	}
}

