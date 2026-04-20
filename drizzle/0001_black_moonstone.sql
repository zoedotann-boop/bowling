CREATE TABLE "branch" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"phone" text NOT NULL,
	"whatsapp" text NOT NULL,
	"email" text NOT NULL,
	"map_url" text NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"brand_accent" text NOT NULL,
	"hero_image_id" text,
	"google_place_id" text,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "branch_slug_unique" UNIQUE("slug"),
	CONSTRAINT "branch_brand_accent_check" CHECK ("branch"."brand_accent" IN ('cherry','teal'))
);
--> statement-breakpoint
CREATE TABLE "branch_translation" (
	"branch_id" text NOT NULL,
	"locale" text NOT NULL,
	"display_name" text,
	"short_name" text,
	"address" text,
	"city" text,
	"hero_headline" text,
	"hero_tagline" text,
	"seo_title" text,
	"seo_description" text,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_generated_at" timestamp,
	"reviewed_at" timestamp,
	CONSTRAINT "branch_translation_branch_id_locale_pk" PRIMARY KEY("branch_id","locale")
);
--> statement-breakpoint
CREATE TABLE "event_offering" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"image_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_offering_translation" (
	"event_offering_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text,
	"description" text,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_generated_at" timestamp,
	"reviewed_at" timestamp,
	CONSTRAINT "event_offering_translation_event_offering_id_locale_pk" PRIMARY KEY("event_offering_id","locale")
);
--> statement-breakpoint
CREATE TABLE "menu_category" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_category_translation" (
	"menu_category_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_generated_at" timestamp,
	"reviewed_at" timestamp,
	CONSTRAINT "menu_category_translation_menu_category_id_locale_pk" PRIMARY KEY("menu_category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "menu_item" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_item_translation" (
	"menu_item_id" text NOT NULL,
	"locale" text NOT NULL,
	"name" text,
	"tag" text,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_generated_at" timestamp,
	"reviewed_at" timestamp,
	CONSTRAINT "menu_item_translation_menu_item_id_locale_pk" PRIMARY KEY("menu_item_id","locale")
);
--> statement-breakpoint
CREATE TABLE "offering_package" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offering_package_translation" (
	"package_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text,
	"perks" text,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_generated_at" timestamp,
	"reviewed_at" timestamp,
	CONSTRAINT "offering_package_translation_package_id_locale_pk" PRIMARY KEY("package_id","locale")
);
--> statement-breakpoint
CREATE TABLE "opening_hours" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" text,
	"close_time" text,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "opening_hours_closed_times_check" CHECK (("opening_hours"."is_closed" = true AND "opening_hours"."open_time" IS NULL AND "opening_hours"."close_time" IS NULL) OR ("opening_hours"."is_closed" = false AND "opening_hours"."open_time" IS NOT NULL AND "opening_hours"."close_time" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "price_row" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"kind" text NOT NULL,
	"weekday_amount_cents" integer NOT NULL,
	"weekend_amount_cents" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "price_row_kind_check" CHECK ("price_row"."kind" IN ('hourly','adult','child','shoe'))
);
--> statement-breakpoint
CREATE TABLE "price_row_translation" (
	"price_row_id" text NOT NULL,
	"locale" text NOT NULL,
	"label" text,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_generated_at" timestamp,
	"reviewed_at" timestamp,
	CONSTRAINT "price_row_translation_price_row_id_locale_pk" PRIMARY KEY("price_row_id","locale")
);
--> statement-breakpoint
CREATE TABLE "media_asset" (
	"id" text PRIMARY KEY NOT NULL,
	"blob_url" text NOT NULL,
	"filename" text,
	"content_type" text,
	"width" integer,
	"height" integer,
	"size_bytes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branch" ADD CONSTRAINT "branch_hero_image_id_media_asset_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media_asset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_translation" ADD CONSTRAINT "branch_translation_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_offering" ADD CONSTRAINT "event_offering_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_offering" ADD CONSTRAINT "event_offering_image_id_media_asset_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_asset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_offering_translation" ADD CONSTRAINT "event_offering_translation_event_offering_id_event_offering_id_fk" FOREIGN KEY ("event_offering_id") REFERENCES "public"."event_offering"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_category" ADD CONSTRAINT "menu_category_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_category_translation" ADD CONSTRAINT "menu_category_translation_menu_category_id_menu_category_id_fk" FOREIGN KEY ("menu_category_id") REFERENCES "public"."menu_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_category_id_menu_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_translation" ADD CONSTRAINT "menu_item_translation_menu_item_id_menu_item_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offering_package" ADD CONSTRAINT "offering_package_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offering_package_translation" ADD CONSTRAINT "offering_package_translation_package_id_offering_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."offering_package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opening_hours" ADD CONSTRAINT "opening_hours_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_row" ADD CONSTRAINT "price_row_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_row_translation" ADD CONSTRAINT "price_row_translation_price_row_id_price_row_id_fk" FOREIGN KEY ("price_row_id") REFERENCES "public"."price_row"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branch_published_idx" ON "branch" USING btree ("published","sort_order");--> statement-breakpoint
CREATE INDEX "branch_translation_locale_idx" ON "branch_translation" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "event_offering_branch_idx" ON "event_offering" USING btree ("branch_id","sort_order");--> statement-breakpoint
CREATE INDEX "event_offering_translation_locale_idx" ON "event_offering_translation" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "menu_category_branch_idx" ON "menu_category" USING btree ("branch_id","sort_order");--> statement-breakpoint
CREATE INDEX "menu_category_translation_locale_idx" ON "menu_category_translation" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "menu_item_category_idx" ON "menu_item" USING btree ("category_id","sort_order");--> statement-breakpoint
CREATE INDEX "menu_item_translation_locale_idx" ON "menu_item_translation" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "offering_package_branch_idx" ON "offering_package" USING btree ("branch_id","sort_order");--> statement-breakpoint
CREATE INDEX "offering_package_translation_locale_idx" ON "offering_package_translation" USING btree ("locale");--> statement-breakpoint
CREATE UNIQUE INDEX "opening_hours_branch_day_idx" ON "opening_hours" USING btree ("branch_id","day_of_week");--> statement-breakpoint
CREATE INDEX "price_row_branch_idx" ON "price_row" USING btree ("branch_id","sort_order");--> statement-breakpoint
CREATE INDEX "price_row_translation_locale_idx" ON "price_row_translation" USING btree ("locale");