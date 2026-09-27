DROP TABLE "lead" CASCADE;--> statement-breakpoint
ALTER TABLE "location" ADD COLUMN "inquiries_email" text DEFAULT '' NOT NULL;