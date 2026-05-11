CREATE TABLE `article_tags` (
	`article_id` text NOT NULL,
	`tag_slug` text NOT NULL,
	PRIMARY KEY(`article_id`, `tag_slug`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_slug`) REFERENCES `tags`(`slug`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`cover` text,
	`cover_alt` text,
	`body_html` text DEFAULT '' NOT NULL,
	`body_markdown` text,
	`category_slug` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`reading_minutes` integer DEFAULT 1 NOT NULL,
	`author_name` text NOT NULL,
	`author_avatar` text,
	`author_bio` text,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`category_slug`) REFERENCES `categories`(`slug`) ON UPDATE cascade ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_uq` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `articles_status_published_idx` ON `articles` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `articles_category_idx` ON `articles` (`category_slug`);--> statement-breakpoint
CREATE INDEX `articles_featured_idx` ON `articles` (`featured`);--> statement-breakpoint
CREATE TABLE `categories` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `categories_sort_idx` ON `categories` (`sort_order`);--> statement-breakpoint
CREATE TABLE `media` (
	`key` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_created_idx` ON `media` (`created_at`);--> statement-breakpoint
CREATE TABLE `tags` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
