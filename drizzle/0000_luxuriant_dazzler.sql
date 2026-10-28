CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text,
	`website` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_uidx` ON `brands` (`slug`);--> statement-breakpoint
CREATE TABLE `categories` (
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
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cat_slug_uidx` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `cat_parent_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `cat_active_sort_idx` ON `categories` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`badge_color` text DEFAULT 'bg-indigo-50 text-indigo-700',
	`home_show` text DEFAULT 'Yes',
	`priority` text DEFAULT '-',
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_uidx` ON `tags` (`slug`);--> statement-breakpoint
CREATE TABLE `product_specs` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `specs_product_idx` ON `product_specs` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`size` text,
	`price` integer,
	`cost_price` integer,
	`stock` integer DEFAULT 0 NOT NULL,
	`opening_stock` integer DEFAULT 0 NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `variants_sku_uidx` ON `product_variants` (`sku`);--> statement-breakpoint
CREATE INDEX `variants_product_idx` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE INDEX `variants_stock_idx` ON `product_variants` (`stock`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`tagline` text,
	`category_id` text,
	`category` text,
	`sub_category_id` text,
	`child_category_id` text,
	`brand_id` text,
	`model` text,
	`price` integer NOT NULL,
	`regular_price` integer,
	`sale_price` integer,
	`original_price` integer DEFAULT 0 NOT NULL,
	`cost_price` integer,
	`sku` text,
	`total_stock` integer DEFAULT 0 NOT NULL,
	`stock` integer,
	`opening_stock` integer DEFAULT 0 NOT NULL,
	`low_stock_alert` integer DEFAULT 5 NOT NULL,
	`in_stock` integer DEFAULT true NOT NULL,
	`is_low_stock` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`badge` text,
	`priority` text DEFAULT '-',
	`is_pre_order` integer DEFAULT false NOT NULL,
	`is_wholesale` integer DEFAULT false NOT NULL,
	`urgency_message` text,
	`enable_processing` integer DEFAULT false NOT NULL,
	`processing_options` text,
	`image` text NOT NULL,
	`featured_image` text,
	`gallery_images` text,
	`size_chart_image` text,
	`description` text NOT NULL,
	`return_policy` text,
	`seo_title` text,
	`seo_description` text,
	`seo_keywords` text,
	`rating` integer DEFAULT 49 NOT NULL,
	`reviews_count` integer DEFAULT 120 NOT NULL,
	`sales_count` integer DEFAULT 0 NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_uidx` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_cat_status_idx` ON `products` (`category_id`,`status`);--> statement-breakpoint
CREATE INDEX `products_status_created_idx` ON `products` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `products_stock_alert_idx` ON `products` (`in_stock`,`total_stock`,`low_stock_alert`);--> statement-breakpoint
CREATE INDEX `products_price_idx` ON `products` (`price`);--> statement-breakpoint
CREATE TABLE `courier_fraud_cache` (
	`phone` text PRIMARY KEY NOT NULL,
	`total_parcels` integer DEFAULT 0 NOT NULL,
	`delivered_parcels` integer DEFAULT 0 NOT NULL,
	`cancelled_parcels` integer DEFAULT 0 NOT NULL,
	`success_rate` integer DEFAULT 0 NOT NULL,
	`courier_name` text DEFAULT 'Steadfast & Pathao',
	`risk_tag` text DEFAULT 'Low Risk',
	`last_checked_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `courier_cache_last_checked_idx` ON `courier_fraud_cache` (`last_checked_at`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`alternate_phone` text,
	`name` text NOT NULL,
	`email` text,
	`address` text NOT NULL,
	`city` text,
	`district` text,
	`total_orders` integer DEFAULT 0 NOT NULL,
	`delivered_orders` integer DEFAULT 0 NOT NULL,
	`cancelled_orders` integer DEFAULT 0 NOT NULL,
	`returned_orders` integer DEFAULT 0 NOT NULL,
	`total_spent` integer DEFAULT 0 NOT NULL,
	`success_rate` integer DEFAULT 100 NOT NULL,
	`risk_level` text DEFAULT 'safe' NOT NULL,
	`is_banned` integer DEFAULT false NOT NULL,
	`ban_reason` text,
	`internal_notes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_phone_uidx` ON `customers` (`phone`);--> statement-breakpoint
CREATE INDEX `customers_total_spent_idx` ON `customers` (`total_spent`);--> statement-breakpoint
CREATE INDEX `customers_orders_count_idx` ON `customers` (`total_orders`);--> statement-breakpoint
CREATE INDEX `customers_risk_banned_idx` ON `customers` (`risk_level`,`is_banned`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text,
	`variant_id` text,
	`product_name` text NOT NULL,
	`variant_name` text,
	`unit_price` integer NOT NULL,
	`cost_price` integer,
	`quantity` integer DEFAULT 1 NOT NULL,
	`subtotal` integer NOT NULL,
	`product_image` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_product_idx` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `order_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`admin_user_id` text,
	`admin_name` text DEFAULT 'Admin Staff' NOT NULL,
	`note` text NOT NULL,
	`call_status` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_notes_order_created_idx` ON `order_notes` (`order_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text,
	`customer_id` text,
	`user_id` text,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text,
	`alternate_phone` text,
	`shipping_address` text NOT NULL,
	`delivery_area` text DEFAULT 'inside_dhaka',
	`subtotal` integer DEFAULT 0,
	`delivery_charge` integer DEFAULT 0 NOT NULL,
	`discount_amount` integer DEFAULT 0 NOT NULL,
	`advance_payment` integer DEFAULT 0 NOT NULL,
	`due_amount` integer DEFAULT 0,
	`total` integer NOT NULL,
	`payment_method` text DEFAULT 'cod' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`order_type` text DEFAULT 'web' NOT NULL,
	`drop_off_stage` text,
	`recovery_status` text,
	`courier_provider` text,
	`tracking_code` text,
	`consignment_id` text,
	`courier_status` text,
	`courier_cost` integer DEFAULT 0,
	`packaging_cost` integer DEFAULT 0,
	`items` text NOT NULL,
	`source` text DEFAULT 'Direct',
	`landing_page_id` text,
	`ip_address` text,
	`user_agent` text,
	`device_fingerprint` text,
	`assigned_admin_id` text,
	`is_trashed` integer DEFAULT false NOT NULL,
	`confirmed_at` integer,
	`shipped_at` integer,
	`delivered_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `orders_number_idx` ON `orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `orders_customer_phone_idx` ON `orders` (`customer_phone`);--> statement-breakpoint
CREATE INDEX `orders_status_created_idx` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_type_status_idx` ON `orders` (`order_type`,`status`);--> statement-breakpoint
CREATE INDEX `orders_trashed_status_idx` ON `orders` (`is_trashed`,`status`);--> statement-breakpoint
CREATE INDEX `orders_tracking_idx` ON `orders` (`tracking_code`);--> statement-breakpoint
CREATE INDEX `orders_created_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `landing_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`sku` text,
	`product_id` text,
	`tag` text,
	`category` text DEFAULT 'General',
	`status` text DEFAULT 'Published' NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`conversions` integer DEFAULT 0 NOT NULL,
	`conversion_rate` text DEFAULT '0%',
	`template` text DEFAULT 'default',
	`custom_domain` text,
	`live_path` text DEFAULT '/',
	`meta_title` text,
	`meta_description` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `landing_slug_uidx` ON `landing_pages` (`slug`);--> statement-breakpoint
CREATE INDEX `landing_status_idx` ON `landing_pages` (`status`);--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`discount_type` text DEFAULT 'percentage' NOT NULL,
	`discount_value` integer NOT NULL,
	`min_order_amount` integer DEFAULT 0,
	`max_discount_amount` integer,
	`usage_limit` integer,
	`usage_count` integer DEFAULT 0 NOT NULL,
	`expires_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_uidx` ON `coupons` (`code`);--> statement-breakpoint
CREATE INDEX `coupons_active_idx` ON `coupons` (`is_active`,`expires_at`);--> statement-breakpoint
CREATE TABLE `daily_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Daily Target' NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`target_amount` integer NOT NULL,
	`consumed_amount` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `daily_targets_status_dates_idx` ON `daily_targets` (`status`,`start_date`,`end_date`);--> statement-breakpoint
CREATE TABLE `banners` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`image` text NOT NULL,
	`target_url` text NOT NULL,
	`placement` text DEFAULT 'hero_bottom' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `banner_placement_status_idx` ON `banners` (`placement`,`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE `carousels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`mobile_image` text,
	`target_url` text NOT NULL,
	`url_type` text DEFAULT 'internal',
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `carousel_active_sort_idx` ON `carousels` (`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE `popups` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`trigger_type` text DEFAULT 'on_load',
	`delay_seconds` integer DEFAULT 5,
	`image_url` text,
	`target_url` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`folder` text DEFAULT 'products' NOT NULL,
	`size` text DEFAULT '50 KB' NOT NULL,
	`dimensions` text DEFAULT '800 x 800',
	`mime_type` text DEFAULT 'image/webp',
	`uploaded_by` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_folder_created_idx` ON `media_assets` (`folder`,`created_at`);--> statement-breakpoint
CREATE TABLE `store_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`group` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_group_key_uidx` ON `store_settings` (`group`,`key`);--> statement-breakpoint
CREATE TABLE `bot_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`ip_address` text NOT NULL,
	`user_agent` text NOT NULL,
	`bot_category` text NOT NULL,
	`threat_level` text NOT NULL,
	`path_visited` text NOT NULL,
	`action_taken` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `bot_logs_category_created_idx` ON `bot_logs` (`bot_category`,`created_at`);--> statement-breakpoint
CREATE INDEX `bot_logs_threat_idx` ON `bot_logs` (`threat_level`);--> statement-breakpoint
CREATE TABLE `ip_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`ip_address` text NOT NULL,
	`phone_no` text,
	`device_id` text,
	`type` text DEFAULT 'Auto Block After 1 Orders',
	`reason` text DEFAULT 'Suspected Fake Orders' NOT NULL,
	`is_permanent` integer DEFAULT false NOT NULL,
	`block_until` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ip_blocks_ip_idx` ON `ip_blocks` (`ip_address`);--> statement-breakpoint
CREATE INDEX `ip_blocks_phone_idx` ON `ip_blocks` (`phone_no`);--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'Admin' NOT NULL,
	`access` text DEFAULT 'Allowed' NOT NULL,
	`is_trashed` integer DEFAULT false NOT NULL,
	`last_login` text,
	`avatar_bg` text DEFAULT 'bg-indigo-600',
	`avatar_text` text DEFAULT 'A',
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_username_uidx` ON `admin_users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `admin_email_uidx` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_user_id` text NOT NULL,
	`admin_name` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`details` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_admin_created_idx` ON `audit_logs` (`admin_user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text DEFAULT 'order' NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`link` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notif_read_created_idx` ON `notifications` (`is_read`,`created_at`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`author` text NOT NULL,
	`role` text NOT NULL,
	`rating` integer DEFAULT 5 NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`verified` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `newsletter` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_email_unique` ON `newsletter` (`email`);