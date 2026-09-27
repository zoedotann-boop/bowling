CREATE TABLE "pricing_content" (
	"location_id" uuid PRIMARY KEY NOT NULL,
	"eyebrow" jsonb,
	"title" jsonb,
	"description" jsonb,
	"weekdays_label" jsonb,
	"weekdays_price" jsonb,
	"weekend_label" jsonb,
	"weekend_price" jsonb,
	"third_game_label" jsonb,
	"third_game_note" jsonb,
	"third_game_price" jsonb,
	"soldier_title" jsonb,
	"soldier_note" jsonb,
	"birthday_eyebrow" jsonb,
	"birthday_title" jsonb,
	"birthday_description" jsonb,
	"birthday_cta_label" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pricing_content" ADD CONSTRAINT "pricing_content_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;