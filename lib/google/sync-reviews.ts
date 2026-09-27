import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { googleReview } from "@/lib/db/schema"

import { fetchPlaceReviews } from "./serpapi"

export type ReviewSyncResult =
  { ok: true; imported: number; updated: number } | { ok: false; error: string }

const AUTO_PUBLISH_MIN_RATING = 4

export async function syncLocationReviews({
  locationId,
  placeId,
  autoPublish = false,
}: {
  locationId: string
  placeId: string
  autoPublish?: boolean
}): Promise<ReviewSyncResult> {
  const result = await fetchPlaceReviews(placeId)
  if (!result.ok) return result

  const existing = await db.query.googleReview.findMany({
    where: eq(googleReview.locationId, locationId),
    columns: { externalId: true },
  })
  const knownIds = new Set(existing.map((row) => row.externalId))

  let imported = 0
  let updated = 0

  for (const review of result.reviews) {
    const isNew = !knownIds.has(review.externalId)
    await db
      .insert(googleReview)
      .values({
        locationId,
        externalId: review.externalId,
        authorName: review.authorName,
        rating: review.rating,
        text: review.text,
        publishedAt: review.publishedAt,
        isPublished: autoPublish && review.rating >= AUTO_PUBLISH_MIN_RATING,
      })
      .onConflictDoUpdate({
        target: [googleReview.locationId, googleReview.externalId],
        set: {
          authorName: review.authorName,
          rating: review.rating,
          text: review.text,
          publishedAt: review.publishedAt,
        },
      })
    if (isNew) imported += 1
    else updated += 1
  }

  return { ok: true, imported, updated }
}
