UPDATE "event_form_field" SET "options" = NULL WHERE "type" = 'time';--> statement-breakpoint
WITH "missing" AS (
  SELECT "event_type_id", coalesce(max("sort_order") FILTER (WHERE "type" = 'date'), max("sort_order")) AS "after"
  FROM "event_form_field"
  GROUP BY "event_type_id"
  HAVING bool_and("type" <> 'time' AND "key" <> 'time')
), "shifted" AS (
  UPDATE "event_form_field" AS f SET "sort_order" = f."sort_order" + 1
  FROM "missing" AS m
  WHERE f."event_type_id" = m."event_type_id" AND f."sort_order" > m."after"
)
INSERT INTO "event_form_field" ("event_type_id", "key", "label", "placeholder", "type", "is_required", "sort_order")
SELECT "event_type_id", 'time', '{"he": "שעה", "en": "Time"}'::jsonb, '{"he": "בחרו שעה", "en": "Choose a time"}'::jsonb, 'time', true, "after" + 1
FROM "missing";
