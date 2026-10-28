import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Customers 360 Table
export const customers = sqliteTable(
	'customers',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		phone: text('phone').notNull(),
		alternatePhone: text('alternate_phone'),
		name: text('name').notNull(),
		email: text('email'),
		address: text('address').notNull(),
		city: text('city'),
		district: text('district'),

		// Order & Delivery Analytics
		totalOrders: integer('total_orders').notNull().default(0),
		deliveredOrders: integer('delivered_orders').notNull().default(0),
		cancelledOrders: integer('cancelled_orders').notNull().default(0),
		returnedOrders: integer('returned_orders').notNull().default(0),
		totalSpent: integer('total_spent').notNull().default(0),
		successRate: integer('success_rate').notNull().default(100), // 0 to 100%

		// Risk Level & Blacklist
		riskLevel: text('risk_level').notNull().default('safe'), // 'safe' | 'moderate' | 'high_risk'
		isBanned: integer('is_banned', { mode: 'boolean' }).notNull().default(false),
		banReason: text('ban_reason'),
		internalNotes: text('internal_notes'),

		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('customers_phone_uidx').on(table.phone),
		index('customers_total_spent_idx').on(table.totalSpent),
		index('customers_orders_count_idx').on(table.totalOrders),
		index('customers_risk_banned_idx').on(table.riskLevel, table.isBanned)
	]
);

// Courier Fraud & Telemetry Cache Table
export const courierFraudCache = sqliteTable(
	'courier_fraud_cache',
	{
		phone: text('phone').primaryKey(),
		totalParcels: integer('total_parcels').notNull().default(0),
		deliveredParcels: integer('delivered_parcels').notNull().default(0),
		cancelledParcels: integer('cancelled_parcels').notNull().default(0),
		successRate: integer('success_rate').notNull().default(0),
		courierName: text('courier_name').default('Steadfast & Pathao'),
		riskTag: text('risk_tag').default('Low Risk'), // 'Low Risk' | 'Moderate' | 'High Risk'
		lastCheckedAt: integer('last_checked_at', { mode: 'timestamp_ms' }).notNull()
	},
	(table) => [index('courier_cache_last_checked_idx').on(table.lastCheckedAt)]
);

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type CourierFraudCache = typeof courierFraudCache.$inferSelect;
export type NewCourierFraudCache = typeof courierFraudCache.$inferInsert;

