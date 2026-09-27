CREATE TABLE "google_review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"author_name" text DEFAULT '' NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "location" ADD COLUMN "google_place_id" text;--> statement-breakpoint
ALTER TABLE "location" ADD COLUMN "google_reviews_auto_sync" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "google_review" ADD CONSTRAINT "google_review_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "google_review_location_external_idx" ON "google_review" USING btree ("location_id","external_id");