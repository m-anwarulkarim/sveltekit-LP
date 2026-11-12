ALTER TABLE `products` ADD `enable_bundle` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `products` ADD `bundle_unit_label` text;
