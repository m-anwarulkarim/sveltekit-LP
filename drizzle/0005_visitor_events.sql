-- Funnel events (ViewContent / AddToCart / InitiateCheckout / Purchase) for admin analytics
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
