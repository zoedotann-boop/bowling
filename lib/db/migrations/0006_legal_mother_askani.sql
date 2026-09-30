ALTER TABLE "event_type_content" ADD COLUMN "allowed_items" jsonb;--> statement-breakpoint
ALTER TABLE "event_type_content" ADD COLUMN "forbidden_items" jsonb;--> statement-breakpoint
ALTER TABLE "event_type_content" ADD COLUMN "rules_note" jsonb;--> statement-breakpoint
ALTER TABLE "event_type_content" ADD COLUMN "policy_items" jsonb;--> statement-breakpoint
ALTER TABLE "event_type_content" ADD COLUMN "policy_note" jsonb;--> statement-breakpoint
ALTER TABLE "event_type_content" ADD COLUMN "form_footnote" jsonb;--> statement-breakpoint
UPDATE "event_type_content" SET "form_intro" = NULL WHERE coalesce(trim("form_intro"->>'he'), '') = '' AND coalesce(trim("form_intro"->>'en'), '') = '';--> statement-breakpoint
UPDATE "event_type_content" SET "form_terms" = NULL WHERE coalesce(trim("form_terms"->>'he'), '') = '' AND coalesce(trim("form_terms"->>'en'), '') = '';
