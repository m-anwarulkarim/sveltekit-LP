import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. Vendor Admin Users Table
export const adminUsers = sqliteTable(
	'admin_users',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id'), // optional link to Better-Auth user
		name: text('name').notNull(),
		username: text('username').notNull(),
		email: text('email').notNull(),
		role: text('role').notNull().default('Admin'), // 'Owner' | 'Super Admin' | 'Manager' | 'Staff'
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
	},
	(table) => [
		uniqueIndex('admin_username_uidx').on(table.username),
		uniqueIndex('admin_email_uidx').on(table.email)
	]
);

// 2. Admin Activity Audit Logs Table (Audit Trail)
export const auditLogs = sqliteTable(
	'audit_logs',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		adminUserId: text('admin_user_id').notNull(),
		adminName: text('admin_name').notNull(),
		action: text('action').notNull(), // 'ORDER_CONFIRMED' | 'PRICE_EDIT' | 'STOCK_UPDATE' | 'CUSTOMER_BAN'
		entityType: text('entity_type').notNull(), // 'order' | 'product' | 'customer' | 'setting'
		entityId: text('entity_id'),
		details: text('details'), // JSON string with diff
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [
		index('audit_admin_created_idx').on(table.adminUserId, table.createdAt),
		index('audit_entity_idx').on(table.entityType, table.entityId)
	]
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
