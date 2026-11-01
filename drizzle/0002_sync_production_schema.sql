-- Brings production D1 up to the Drizzle schema without rebuilding any table that holds data.
-- Additive only, apart from rebuilding the empty `reviews` table.
--
-- How to apply (once, production only):
--   1. Record a restore point: npx wrangler d1 time-travel info aura
--   2. Apply this file directly:
--      npx wrangler d1 execute aura --remote --file=drizzle/0002_sync_production_schema.sql
--
-- Do NOT use `wrangler d1 migrations apply` or `drizzle-kit migrate`: production has no
-- migration tracking table, so they would replay 0000 and 0001 from the start.
-- Do not run drizzle/0001_clear_thunderbird.sql: on a database with double-quoted
-- string literals enabled it copies column NAMES into existing rows.
--
-- After applying, only the Owner has menu access. Every other admin has permissions '[]'
-- and all admins have password_hash NULL until the Owner sets them.
--
-- Not included on purpose:
--   orders.customer_id and categories.parent_id foreign keys need a table rebuild.
--   DROP TABLE runs an implicit DELETE, which would fire the cascades on order_items,
--   order_notes and products.category_id.
--   admin_users.plain_password_hint must never exist.

-- admin_users: an empty permission list denies access; the Owner gets full access explicitly.
ALTER TABLE `admin_users` ADD COLUMN `password_hash` text;--> statement-breakpoint
ALTER TABLE `admin_users` ADD COLUMN `permissions` text DEFAULT '[]';--> statement-breakpoint
UPDATE `admin_users` SET `permissions` = '["*"]' WHERE `role` = 'Owner';--> statement-breakpoint

-- brands
ALTER TABLE `brands` ADD COLUMN `is_featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `brands` ADD COLUMN `sort_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `brands` ADD COLUMN `is_trash` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `brands` ADD COLUMN `updated_at` integer;--> statement-breakpoint
UPDATE `brands` SET `updated_at` = `created_at`;--> statement-breakpoint

-- categories, tags, popups, notifications
ALTER TABLE `categories` ADD COLUMN `updated_at` integer;--> statement-breakpoint
UPDATE `categories` SET `updated_at` = `created_at`;--> statement-breakpoint
ALTER TABLE `tags` ADD COLUMN `updated_at` integer;--> statement-breakpoint
UPDATE `tags` SET `updated_at` = `created_at`;--> statement-breakpoint
ALTER TABLE `popups` ADD COLUMN `updated_at` integer;--> statement-breakpoint
UPDATE `popups` SET `updated_at` = `created_at`;--> statement-breakpoint
ALTER TABLE `notifications` ADD COLUMN `updated_at` integer;--> statement-breakpoint
UPDATE `notifications` SET `updated_at` = `created_at`;--> statement-breakpoint

-- banners
ALTER TABLE `banners` ADD COLUMN `url_type` text DEFAULT 'Internal';--> statement-breakpoint
ALTER TABLE `banners` ADD COLUMN `display_options` text DEFAULT 'Show on Home';--> statement-breakpoint
ALTER TABLE `banners` ADD COLUMN `updated_at` integer;--> statement-breakpoint
UPDATE `banners` SET `updated_at` = `created_at`;--> statement-breakpoint

-- carousels
ALTER TABLE `carousels` ADD COLUMN `description` text;--> statement-breakpoint
ALTER TABLE `carousels` ADD COLUMN `start_date` integer;--> statement-breakpoint
ALTER TABLE `carousels` ADD COLUMN `end_date` integer;--> statement-breakpoint
ALTER TABLE `carousels` ADD COLUMN `view_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `carousels` ADD COLUMN `click_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `carousels` ADD COLUMN `updated_at` integer;--> statement-breakpoint
UPDATE `carousels` SET `updated_at` = `created_at`;--> statement-breakpoint

-- coupons (0 rows on production)
ALTER TABLE `coupons` ADD COLUMN `name` text DEFAULT 'Special Discount' NOT NULL;--> statement-breakpoint
ALTER TABLE `coupons` ADD COLUMN `banner_image` text;--> statement-breakpoint
ALTER TABLE `coupons` ADD COLUMN `description` text;--> statement-breakpoint
ALTER TABLE `coupons` ADD COLUMN `start_date` text;--> statement-breakpoint
ALTER TABLE `coupons` ADD COLUMN `end_date` text;--> statement-breakpoint
ALTER TABLE `coupons` ADD COLUMN `status` text DEFAULT 'publish' NOT NULL;--> statement-breakpoint
ALTER TABLE `coupons` ADD COLUMN `updated_at` integer;--> statement-breakpoint
UPDATE `coupons` SET `updated_at` = `created_at`;--> statement-breakpoint
DROP INDEX IF EXISTS `coupons_active_idx`;--> statement-breakpoint
ALTER TABLE `coupons` DROP COLUMN `expires_at`;--> statement-breakpoint
CREATE INDEX `coupons_active_idx` ON `coupons` (`is_active`,`end_date`);--> statement-breakpoint
CREATE INDEX `coupons_status_idx` ON `coupons` (`status`);--> statement-breakpoint

-- reviews (0 rows on production, nothing references it, so a rebuild is safe)
DROP TABLE `reviews`;--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`author` text NOT NULL,
	`role` text NOT NULL,
	`rating` integer DEFAULT 5 NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`verified` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`product_id`);--> statement-breakpoint

-- user_carts
CREATE TABLE IF NOT EXISTS `user_carts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`coupon_code` text,
	`discount_percent` integer DEFAULT 0,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint

-- Missing indexes. The order number index is unique: production has no duplicates today.
CREATE INDEX `orders_customer_id_idx` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_number_uidx` ON `orders` (`order_number`);--> statement-breakpoint
DROP INDEX `orders_number_idx`;--> statement-breakpoint
CREATE INDEX `products_sub_cat_idx` ON `products` (`sub_category_id`);--> statement-breakpoint
CREATE INDEX `products_child_cat_idx` ON `products` (`child_category_id`);--> statement-breakpoint
CREATE INDEX `landing_product_idx` ON `landing_pages` (`product_id`);
