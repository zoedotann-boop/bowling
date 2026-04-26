CREATE TABLE "branch_domain" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"host" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "branch_domain_host_unique" UNIQUE("host")
);
--> statement-breakpoint
ALTER TABLE "branch_domain" ADD CONSTRAINT "branch_domain_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branch_domain_branch_idx" ON "branch_domain" USING btree ("branch_id");