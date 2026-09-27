"use server"

import { and, asc, desc, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireLocationAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import { googleReview, location } from "@/lib/db/schema"
import { syncLocationReviews } from "@/lib/google/sync-reviews"

import { reviewsSchema, type GoogleReviewDraft } from "./schemas"
import { type ActionResult, OK, readSlug } from "./shared"

// Serializes a stored review row into the form's draft shape.
function toReviewDraft(row: {
  id: string
  authorName: string
  rating: number
  text: string
  publishedAt: Date
  isPublished: boolean
}): GoogleReviewDraft {
  return {
    id: row.id,
    authorName: row.authorName,
    rating: row.rating,
    text: row.text,
    publishedAt: row.publishedAt.toISOString().slice(0, 10),
    isPublished: row.isPublished,
  }
}

async function listReviews(locationId: string): Promise<GoogleReviewDraft[]> {
  const rows = await db.query.googleReview.findMany({
    where: eq(googleReview.locationId, locationId),
    orderBy: (row) => [asc(row.sortOrder), desc(row.publishedAt)],
  })
  return rows.map(toReviewDraft)
}

type SyncResult =
  | {
      ok: true
      imported: number
      updated: number
      reviews: GoogleReviewDraft[]
    }
  | { ok: false; error: string }

// "Sync now": fetches the branch's Google reviews immediately and returns the
// refreshed list so the admin table updates without a reload. Auto-publish
// follows the branch's own toggle, mirroring the nightly cron.
export async function syncGoogleReviews(input: unknown): Promise<SyncResult> {
  const { location: loc } = await requireLocationAccess(
    readSlug(input),
    "content"
  )
  if (!loc.googlePlaceId) return { ok: false, error: "missing-place-id" }

  const result = await syncLocationReviews({
    locationId: loc.id,
    placeId: loc.googlePlaceId,
    autoPublish: loc.googleReviewsAutoSync,
  })
  if (!result.ok) return result

  revalidatePath("/")
  return { ...result, reviews: await listReviews(loc.id) }
}

// Persists the pooler config (place id + auto-sync) and the admin's curation:
// each row's published flag and order, deleting any rows removed from the list.
export async function saveGoogleReviews(input: unknown): Promise<ActionResult> {
  const { location: loc } = await requireLocationAccess(
    readSlug(input),
    "content"
  )

  const parsed = reviewsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const data = parsed.data

  await db
    .update(location)
    .set({
      googlePlaceId: data.googlePlaceId.trim() || null,
      googleReviewsAutoSync: data.autoSync,
    })
    .where(eq(location.id, loc.id))

  const existing = await db.query.googleReview.findMany({
    where: eq(googleReview.locationId, loc.id),
    columns: { id: true },
  })
  const keepIds = new Set(data.reviews.map((row) => row.id))
  const toDelete = existing
    .map((row) => row.id)
    .filter((id) => !keepIds.has(id))
  if (toDelete.length > 0) {
    await db.delete(googleReview).where(inArray(googleReview.id, toDelete))
  }

  for (const [sortOrder, row] of data.reviews.entries()) {
    await db
      .update(googleReview)
      .set({ isPublished: row.isPublished, sortOrder })
      .where(
        and(eq(googleReview.id, row.id), eq(googleReview.locationId, loc.id))
      )
  }

  revalidatePath("/")
  return OK
}
