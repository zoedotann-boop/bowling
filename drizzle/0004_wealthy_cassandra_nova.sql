CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"google_review_id" text NOT NULL,
	"author_name" text NOT NULL,
	"author_avatar_url" text,
	"rating" integer NOT NULL,
	"published_at" timestamp NOT NULL,
	"original_locale" text,
	"text_original" text,
	"text_he" text,
	"text_en" text,
	"text_ru" text,
	"text_ar" text,
	"ai_translated" boolean DEFAULT false NOT NULL,
	"ai_translated_at" timestamp,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_rating_check" CHECK ("review"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "review_cache" (
	"branch_id" text PRIMARY KEY NOT NULL,
	"place_name" text,
	"total_rating_count" integer,
	"average_rating" real,
	"payload" jsonb,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_cache" ADD CONSTRAINT "review_cache_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "review_branch_google_idx" ON "review" USING btree ("branch_id","google_review_id");--> statement-breakpoint
CREATE INDEX "review_branch_published_idx" ON "review" USING btree ("branch_id","published_at");