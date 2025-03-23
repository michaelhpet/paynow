CREATE TABLE `payments` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`amount` real NOT NULL,
	`status` text NOT NULL,
	`reference` text NOT NULL,
	`access_code` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
