/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'legal_page'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "legal_page" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "legal_page" ADD CONSTRAINT "legal_page_branch_id_slug_pk" PRIMARY KEY("branch_id","slug");--> statement-breakpoint
ALTER TABLE "legal_page" ADD COLUMN "branch_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "legal_page" ADD CONSTRAINT "legal_page_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "legal_page_branch_sort_idx" ON "legal_page" USING btree ("branch_id","sort_order");