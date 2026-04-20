CREATE TABLE "footer_link" (
	"id" text PRIMARY KEY NOT NULL,
	"locale" text NOT NULL,
	"group_key" text NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_page" (
	"slug" text PRIMARY KEY NOT NULL,
	"title_he" text,
	"title_en" text,
	"title_ru" text,
	"title_ar" text,
	"body_markdown_he" text,
	"body_markdown_en" text,
	"body_markdown_ru" text,
	"body_markdown_ar" text,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "footer_link_locale_group_idx" ON "footer_link" USING btree ("locale","group_key","sort_order");