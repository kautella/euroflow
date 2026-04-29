CREATE TABLE `bank_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`aspsp_id` text NOT NULL,
	`institution_name` text NOT NULL,
	`country` text NOT NULL,
	`iban` text,
	`account_name` text NOT NULL,
	`account_type` text NOT NULL,
	`actual_account_id` text,
	`session_id` text NOT NULL,
	`consent_expires` text NOT NULL,
	`last_sync_date` text,
	`last_expiry_warning_sent` text,
	`skip_pending` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ran_at` text NOT NULL,
	`trigger` text NOT NULL,
	`status` text NOT NULL,
	`imported` integer DEFAULT 0 NOT NULL,
	`skipped` integer DEFAULT 0 NOT NULL,
	`message` text,
	`duration_ms` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_refs` (
	`account_id` integer NOT NULL,
	`ref` text NOT NULL,
	`booking_date` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `bank_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sync_refs_account_ref` ON `sync_refs` (`account_id`,`ref`);