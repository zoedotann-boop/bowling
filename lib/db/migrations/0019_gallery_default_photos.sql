INSERT INTO "gallery_image" ("location_id", "image_url", "sort_order")
SELECT "location"."id", "photo"."image_url", "photo"."sort_order"
FROM "location"
CROSS JOIN (
	VALUES
		('/gallery/1.png', 0),
		('/gallery/2.png', 1),
		('/gallery/3.png', 2),
		('/gallery/4.png', 3),
		('/gallery/5.png', 4)
) AS "photo" ("image_url", "sort_order")
WHERE NOT EXISTS (
	SELECT 1 FROM "gallery_image" WHERE "gallery_image"."location_id" = "location"."id"
);
