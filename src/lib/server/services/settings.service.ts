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
}

