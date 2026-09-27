CREATE TYPE "public"."legal_page_kind" AS ENUM('terms', 'accessibility');--> statement-breakpoint
CREATE TABLE "legal_page" (
	"location_id" uuid NOT NULL,
	"kind" "legal_page_kind" NOT NULL,
	"body" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "legal_page_location_id_kind_pk" PRIMARY KEY("location_id","kind")
);
--> statement-breakpoint
ALTER TABLE "legal_page" ADD CONSTRAINT "legal_page_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;