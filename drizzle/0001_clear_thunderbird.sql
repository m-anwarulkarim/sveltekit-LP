PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_banners` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`image` text NOT NULL,
	`target_url` text NOT NULL,
	`url_type` text DEFAULT 'Internal',
	`placement` text DEFAULT 'Home Page Top Banner' NOT NULL,
	`display_options` text DEFAULT 'Show on Home',
	`sort_order` integer DEFAULT 10 NOT NULL,
	`status` text DEFAULT 'Publish' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_banners`("id", "title", "image", "target_url", "url_type", "placement", "display_options", "sort_order", "status", "created_at", "updated_at") SELECT "id", "title", "image", "target_url", "url_type", "placement", "display_options", "sort_order", "status", "created_at", "updated_at" FROM `banners`;--> statement-breakpoint
DROP TABLE `banners`;--> statement-breakpoint
ALTER TABLE `__new_banners` RENAME TO `banners`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `banner_placement_status_idx` ON `banners` (`placement`,`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE `__new_carousels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`mobile_image` text,
	`target_url` text NOT NULL,
	`url_type` text DEFAULT 'Internal',
	`description` text,
	`sort_order` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'Publish' NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`view_count` integer DEFAULT 0,
	`click_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);
--> statement-breakpoint
INSERT INTO `__new_carousels`("id", "name", "image", "mobile_image", "target_url", "url_type", "description", "sort_order", "status", "start_date", "end_date", "view_count", "click_count", "created_at", "updated_at") SELECT "id", "name", "image", "mobile_image", "target_url", "url_type", "description", "sort_order", "status", "start_date", "end_date", "view_count", "click_count", "created_at", "updated_at" FROM `carousels`;--> statement-breakpoint
DROP TABLE `carousels`;--> statement-breakpoint
ALTER TABLE `__new_carousels` RENAME TO `carousels`;--> statement-breakpoint
CREATE INDEX `carousel_active_sort_idx` ON `carousels` (`status`,`sort_order`);--> statement-breakpoint
ALTER TABLE `brands` ADD `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`parent_id` text,
	`icon` text,
	`image` text,
	`banner_image` text,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "slug", "parent_id", "icon", "image", "banner_image", "description", "sort_order", "is_active", "seo_title", "seo_description", "created_at", "updated_at") SELECT "id", "name", "slug", "parent_id", "icon", "image", "banner_image", "description", "sort_order", "is_active", "seo_title", "seo_description", "created_at", "updated_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
CREATE UNIQUE INDEX `cat_slug_uidx` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `cat_parent_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `cat_active_sort_idx` ON `categories` (`is_active`,`sort_order`);--> statement-breakpoint
ALTER TABLE `tags` ADD `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;--> statement-breakpoint
ALTER TABLE `coupons` ADD `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;--> statement-breakpoint
ALTER TABLE `popups` ADD `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;--> statement-breakpoint
ALTER TABLE `admin_users` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `admin_users` ADD `password_hash` text;--> statement-breakpoint
ALTER TABLE `admin_users` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;--> statement-breakpoint
CREATE TABLE `__new_reviews` (
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
);
--> statement-breakpoint
INSERT INTO `__new_reviews`("id", "product_id", "author", "role", "rating", "title", "content", "verified", "created_at", "updated_at") SELECT "id", "product_id", "author", "role", "rating", "title", "content", "verified", "created_at", "updated_at" FROM `reviews`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
ALTER TABLE `__new_reviews` RENAME TO `reviews`;--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`product_id`);--> statement-breakpoint
CREATE INDEX `products_sub_cat_idx` ON `products` (`sub_category_id`);--> statement-breakpoint
CREATE INDEX `products_child_cat_idx` ON `products` (`child_category_id`);--> statement-breakpoint
CREATE INDEX `orders_customer_id_idx` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `landing_product_idx` ON `landing_pages` (`product_id`);