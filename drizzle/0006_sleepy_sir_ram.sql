DROP INDEX "footer_link_locale_group_idx";--> statement-breakpoint
ALTER TABLE "footer_link" ADD COLUMN "branch_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "media_asset" ADD COLUMN "branch_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "footer_link" ADD CONSTRAINT "footer_link_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "footer_link_branch_locale_group_idx" ON "footer_link" USING btree ("branch_id","locale","group_key","sort_order");--> statement-breakpoint
CREATE INDEX "media_asset_branch_idx" ON "media_asset" USING btree ("branch_id","created_at");