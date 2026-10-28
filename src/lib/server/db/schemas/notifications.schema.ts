import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Notifications Table
export const notifications = sqliteTable(
	'notifications',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		title: text('title').notNull(),
		description: text('description').notNull(),
		category: text('category').notNull().default('order'), // 'order' | 'courier' | 'system'
		isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
		link: text('link'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('notif_read_created_idx').on(table.isRead, table.createdAt)]
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

