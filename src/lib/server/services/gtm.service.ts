import { eq, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface GtmSettings {
	isEnabled: boolean;
	gtmId: string; // e.g. "GTM-XXXXXXX"
	ga4MeasurementId?: string; // e.g. "G-XXXXXXXXXX"
	enableDataLayer: boolean;
	events: {
		pageView: boolean;
		viewItem: boolean;
		addToCart: boolean;
		removeFromCart: boolean;
		viewCart: boolean;
		beginCheckout: boolean;
		purchase: boolean;
	};
	updatedAt?: string | number;
}

export const DEFAULT_GTM_SETTINGS: GtmSettings = {
	isEnabled: false,
	gtmId: '',
	ga4MeasurementId: '',
	enableDataLayer: true,
	events: {
		pageView: true,
		viewItem: true,
		addToCart: true,
		removeFromCart: true,
		viewCart: true,
		beginCheckout: true,
		purchase: true
	}
};

export class GtmService {
	/**
	 * Retrieves GTM & GA4 Settings from D1 store_settings
	 */
	static async getSettings(db: DrizzleD1Database<typeof schema>): Promise<GtmSettings> {
		try {
			const row = await db
				.select()
				.from(schema.storeSettings)
				.where(and(eq(schema.storeSettings.group, 'tracking'), eq(schema.storeSettings.key, 'gtm')))
				.get();

			if (!row || !row.value) {
				return DEFAULT_GTM_SETTINGS;
			}

			const parsed = JSON.parse(row.value);
			return {
				...DEFAULT_GTM_SETTINGS,
				...parsed,
				events: {
					...DEFAULT_GTM_SETTINGS.events,
					...(parsed.events || {})
				}
			};
		} catch (err) {
			console.error('Failed to load GTM settings from D1:', err);
			return DEFAULT_GTM_SETTINGS;
		}
	}

	/**
	 * Saves GTM & GA4 Settings to D1 store_settings
	 */
	static async saveSettings(
		db: DrizzleD1Database<typeof schema>,
		settings: Partial<GtmSettings>
	): Promise<boolean> {
		try {
			const current = await this.getSettings(db);
			const merged: GtmSettings = {
				...current,
				...settings,
				events: {
					...current.events,
					...(settings.events || {})
				},
				updatedAt: new Date().toISOString()
			};

			const jsonStr = JSON.stringify(merged);

			const existing = await db
				.select()
				.from(schema.storeSettings)
				.where(and(eq(schema.storeSettings.group, 'tracking'), eq(schema.storeSettings.key, 'gtm')))
				.get();

			if (existing) {
				await db
					.update(schema.storeSettings)
					.set({
						value: jsonStr,
						updatedAt: new Date()
					})
					.where(eq(schema.storeSettings.id, existing.id));
			} else {
				await db.insert(schema.storeSettings).values({
					id: crypto.randomUUID(),
					group: 'tracking',
					key: 'gtm',
					value: jsonStr,
					updatedAt: new Date()
				});
			}

			return true;
		} catch (err) {
			console.error('Failed to save GTM settings to D1:', err);
			return false;
		}
	}

	/**
	 * Public client config exposed to storefront layout
	 */
	static async getPublicConfig(db: DrizzleD1Database<typeof schema>): Promise<{
		isEnabled: boolean;
		gtmId: string;
		ga4MeasurementId?: string;
		enableDataLayer: boolean;
		events: GtmSettings['events'];
	}> {
		const s = await this.getSettings(db);
		return {
			isEnabled: s.isEnabled && Boolean(s.gtmId && s.gtmId.trim().startsWith('GTM-')),
			gtmId: s.gtmId ? s.gtmId.trim() : '',
			ga4MeasurementId: s.ga4MeasurementId ? s.ga4MeasurementId.trim() : '',
			enableDataLayer: s.enableDataLayer,
			events: s.events
		};
	}
}

