import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. IP & Phone Number Blacklist Table
export const ipBlocks = sqliteTable(
	'ip_blocks',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		ipAddress: text('ip_address').notNull(),
		phoneNo: text('phone_no'),
		deviceId: text('device_id'),
		type: text('type').default('Auto Block After 1 Orders'), // 'Manual' | 'Auto Block'
		reason: text('reason').notNull().default('Suspected Fake Orders'),
		isPermanent: integer('is_permanent', { mode: 'boolean' }).notNull().default(false),
		blockUntil: integer('block_until', { mode: 'timestamp_ms' }),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [
		index('ip_blocks_ip_idx').on(table.ipAddress),
		index('ip_blocks_phone_idx').on(table.phoneNo)
	]
);

// 2. Bot Traffic & Crawler Telemetry Log Table
export const botLogs = sqliteTable(
	'bot_logs',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		ipAddress: text('ip_address').notNull(),
		userAgent: text('user_agent').notNull(),
		botCategory: text('bot_category').notNull(), // 'search' | 'headless' | 'ai' | 'blocked'
		threatLevel: text('threat_level').notNull(), // 'low' | 'moderate' | 'critical'
		pathVisited: text('path_visited').notNull(),
		actionTaken: text('action_taken').notNull(), // 'allowed' | 'blocked' | 'challenged'
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [
		index('bot_logs_category_created_idx').on(table.botCategory, table.createdAt),
		index('bot_logs_threat_idx').on(table.threatLevel)
	]
);

export type IpBlock = typeof ipBlocks.$inferSelect;
export type NewIpBlock = typeof ipBlocks.$inferInsert;
export type BotLog = typeof botLogs.$inferSelect;
export type NewBotLog = typeof botLogs.$inferInsert;

