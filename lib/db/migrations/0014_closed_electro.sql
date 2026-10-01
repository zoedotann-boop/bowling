-- Live may already have this column from an earlier, unmerged migration.
ALTER TABLE "event_type_content" ADD COLUMN IF NOT EXISTS "badges" jsonb;
