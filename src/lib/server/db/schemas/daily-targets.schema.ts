import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Daily Targets Table
export const dailyTargets = sqliteTable(
	'daily_targets',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		title: text('title').notNull().default('Daily Target'),
		startDate: text('start_date').notNull(),
		endDate: text('end_date').notNull(),
		targetAmount: integer('target_amount').notNull(),
		consumedAmount: integer('consumed_amount').notNull().default(0),
		status: text('status').notNull().default('active'), // 'active' | 'upcoming' | 'completed'
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('daily_targets_status_dates_idx').on(table.status, table.startDate, table.endDate)]
);

export type DailyTarget = typeof dailyTargets.$inferSelect;
export type NewDailyTarget = typeof dailyTargets.$inferInsert;
