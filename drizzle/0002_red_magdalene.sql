ALTER TABLE "media_asset" ADD COLUMN "uploaded_by" text;--> statement-breakpoint
ALTER TABLE "media_asset" ADD COLUMN "alt_text_he" text;--> statement-breakpoint
ALTER TABLE "media_asset" ADD COLUMN "alt_text_en" text;--> statement-breakpoint
ALTER TABLE "media_asset" ADD COLUMN "alt_text_ru" text;--> statement-breakpoint
ALTER TABLE "media_asset" ADD COLUMN "alt_text_ar" text;--> statement-breakpoint
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;