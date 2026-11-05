-- 0003: Add moderation, admin reply, and customer fields to reviews table
-- Safe to run on production: all columns are nullable or have defaults, no data loss.
-- Existing reviews get status='approved' so they stay visible.

ALTER TABLE `reviews` ADD COLUMN `status` text NOT NULL DEFAULT 'approved';
--> statement-breakpoint
ALTER TABLE `reviews` ADD COLUMN `is_featured` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `reviews` ADD COLUMN `admin_reply` text;
--> statement-breakpoint
ALTER TABLE `reviews` ADD COLUMN `admin_reply_at` integer;
--> statement-breakpoint
ALTER TABLE `reviews` ADD COLUMN `replied_by` text;
--> statement-breakpoint
ALTER TABLE `reviews` ADD COLUMN `phone` text;
--> statement-breakpoint
ALTER TABLE `reviews` ADD COLUMN `images` text;
--> statement-breakpoint
ALTER TABLE `reviews` ADD COLUMN `helpful_count` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `reviews_status_idx` ON `reviews` (`status`);
