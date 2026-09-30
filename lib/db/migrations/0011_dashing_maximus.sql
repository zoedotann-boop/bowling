DO $$ BEGIN CREATE TYPE "public"."price_summary_mode" AS ENUM('auto', 'manual', 'hidden'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
ALTER TABLE "event_type_content" ADD COLUMN IF NOT EXISTS "price_note" jsonb;--> statement-breakpoint
ALTER TABLE "event_type_content" ADD COLUMN IF NOT EXISTS "price_options" jsonb;--> statement-breakpoint
ALTER TABLE "event_type_content" ADD COLUMN IF NOT EXISTS "price_summary_mode" "price_summary_mode";--> statement-breakpoint
ALTER TABLE "event_type_content" ADD COLUMN IF NOT EXISTS "price_summary_rows" jsonb;--> statement-breakpoint
UPDATE "event_type_content" SET "price_options" = jsonb_build_array(jsonb_build_object('label', '{"he": "מחיר החבילה", "en": "Package price"}'::jsonb, 'days', '{"he": "", "en": ""}'::jsonb, 'badge', '{"he": "", "en": ""}'::jsonb, 'amount', "package_amount", 'childrenCount', "package_children_count", 'extraChildAmount', "extra_child_amount")) WHERE "package_amount" IS NOT NULL AND "price_options" IS NULL;
--> statement-breakpoint
UPDATE "event_type_content" AS c SET "deposit_amount" = 200 FROM "event_type" AS t, "location" AS l WHERE c."event_type_id" = t."id" AND t."location_id" = l."id" AND l."slug" = 'rishon' AND t."slug" = 'birthdays' AND c."deposit_amount" IS NULL;
