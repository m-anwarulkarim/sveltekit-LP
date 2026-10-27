import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Vendor Admin Users Table
export const adminUsers = sqliteTable('admin_users', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id'), // optional link to auth.user
	name: text('name').notNull(),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	role: text('role').notNull().default('Admin'),
	access: text('access').notNull().default('Allowed'), // 'Allowed' | 'Restricted' | 'Suspended'
	isTrashed: integer('is_trashed', { mode: 'boolean' }).notNull().default(false),
	lastLogin: text('last_login'),
	avatarBg: text('avatar_bg').default('bg-indigo-600'),
	avatarText: text('avatar_text').default('A'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
