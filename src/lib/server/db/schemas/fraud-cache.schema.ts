import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const fraudCache = sqliteTable(
	'fraud_cache',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		phone: text('phone').notNull(),
		// Raw result stored as JSON
		resultJson: text('result_json').notNull(),
		// Denormalized quick-access fields
		riskTag: text('risk_tag').notNull().default('New'),
		score: integer('score').notNull().default(0),
		totalParcels: integer('total_parcels').notNull().default(0),
		provider: text('provider').notNull().default('smartpos'),
		checkedAt: integer('checked_at').notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
		updatedAt: integer('updated_at').notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
	},
	(t) => [
		index('fraud_cache_phone_idx').on(t.phone),
		index('fraud_cache_risk_idx').on(t.riskTag)
	]
);
