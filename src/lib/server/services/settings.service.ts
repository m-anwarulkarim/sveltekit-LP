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
}

