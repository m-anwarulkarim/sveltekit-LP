import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. Visitor Sessions (Stores unique visitor session telemetry)
export const visitorSessions = sqliteTable(
	'visitor_sessions',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		sessionId: text('session_id').notNull(),
		ipAddress: text('ip_address'),
		city: text('city'),
		country: text('country').default('BD'),
		deviceType: text('device_type').default('mobile'), // 'mobile' | 'desktop' | 'tablet'
		os: text('os'), // 'Android' | 'iOS' | 'Windows' | 'Mac' | 'Linux' | 'Other'
		browser: text('browser'), // 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other'
		referrer: text('referrer'),
		trafficSource: text('traffic_source').default('Direct'), // 'Facebook Ads' | 'Google' | 'TikTok' | 'Direct' | 'WhatsApp' | 'Other'
		utmSource: text('utm_source'),
		utmMedium: text('utm_medium'),
		utmCampaign: text('utm_campaign'),
		firstPage: text('first_page'),
		lastPage: text('last_page'),
		pageviewsCount: integer('pageviews_count').notNull().default(1),
		isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
		hasOrdered: integer('has_ordered', { mode: 'boolean' }).notNull().default(false),
		lastActiveAt: integer('last_active_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
	},
	(table) => [
		index('idx_visitor_session_id').on(table.sessionId),
		index('idx_visitor_last_active').on(table.lastActiveAt),
		index('idx_visitor_created_at').on(table.createdAt),
		index('idx_visitor_traffic_source').on(table.trafficSource)
	]
);

// 2. Visitor Pageviews (Detailed real-time stream of page events)
export const visitorPageviews = sqliteTable(
	'visitor_pageviews',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		sessionId: text('session_id').notNull(),
		path: text('path').notNull(),
		pageTitle: text('page_title'),
		trafficSource: text('traffic_source').default('Direct'),
		deviceType: text('device_type').default('mobile'),
		city: text('city'),
		isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
	},
	(table) => [
		index('idx_pageview_session_id').on(table.sessionId),
		index('idx_pageview_created_at').on(table.createdAt),
		index('idx_pageview_path').on(table.path)
	]
);
