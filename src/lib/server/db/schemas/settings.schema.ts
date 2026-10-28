import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Store Settings Table (Backs all 24 admin settings sub-modules)
export const storeSettings = sqliteTable(
	'store_settings',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		group: text('group').notNull(), // 'courier' | 'delivery' | 'sms' | 'pixel' | 'invoice' | 'general' | 'payment'
		key: text('key').notNull(), // e.g. 'steadfast_api_key' | 'inside_dhaka_charge' | 'free_shipping_threshold'
		value: text('value').notNull(), // Stored as JSON string or text value
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [uniqueIndex('settings_group_key_uidx').on(table.group, table.key)]
);

export type StoreSetting = typeof storeSettings.$inferSelect;
export type NewStoreSetting = typeof storeSettings.$inferInsert;

