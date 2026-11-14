CREATE TABLE `fraud_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`result_json` text NOT NULL,
	`risk_tag` text NOT NULL DEFAULT 'New',
	`score` integer NOT NULL DEFAULT 0,
	`total_parcels` integer NOT NULL DEFAULT 0,
	`provider` text NOT NULL DEFAULT 'smartpos',
	`checked_at` integer NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
	`updated_at` integer NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);
CREATE INDEX `fraud_cache_phone_idx` ON `fraud_cache` (`phone`);
CREATE INDEX `fraud_cache_risk_idx` ON `fraud_cache` (`risk_tag`);
