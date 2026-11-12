-- Visitor analytics tables.
--
-- These were originally created with `drizzle-kit push` straight against the
-- first database, so no migration ever carried them. Projects provisioned from
-- the migration history therefore had no visitor_sessions / visitor_pageviews,
-- every analytics query threw, and the admin visitor deck silently reported
-- zeros. Written with IF NOT EXISTS so databases that already have them are
-- untouched.

CREATE TABLE IF NOT EXISTS `visitor_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`ip_address` text,
	`city` text,
	`country` text DEFAULT 'BD',
	`device_type` text DEFAULT 'mobile',
	`os` text,
	`browser` text,
	`referrer` text,
	`traffic_source` text DEFAULT 'Direct',
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`first_page` text,
	`last_page` text,
	`pageviews_count` integer DEFAULT 1 NOT NULL,
	`has_ordered` integer DEFAULT 0 NOT NULL,
	`is_admin` integer DEFAULT 0 NOT NULL,
	`last_active_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_visitor_session_id` ON `visitor_sessions` (`session_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_visitor_last_active` ON `visitor_sessions` (`last_active_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_visitor_created_at` ON `visitor_sessions` (`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_visitor_traffic_source` ON `visitor_sessions` (`traffic_source`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `visitor_pageviews` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`path` text NOT NULL,
	`page_title` text,
	`traffic_source` text DEFAULT 'Direct',
	`device_type` text DEFAULT 'mobile',
	`city` text,
	`is_admin` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_pageview_session_id` ON `visitor_pageviews` (`session_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_pageview_created_at` ON `visitor_pageviews` (`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_pageview_path` ON `visitor_pageviews` (`path`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `visitor_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`event_type` text NOT NULL,
	`path` text,
	`value` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_vevent_type_created` ON `visitor_events` (`event_type`,`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_vevent_session` ON `visitor_events` (`session_id`);
