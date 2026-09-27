import { and, eq, isNotNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"
import {
  syncLocationReviews,
  type ReviewSyncResult,
} from "@/lib/google/sync-reviews"

// Nightly Google-reviews pooler. Vercel Cron (see vercel.json) hits this route
// with `Authorization: Bearer <CRON_SECRET>`; every branch that opted into
// auto-sync and has a place id gets its reviews refreshed and high-rated new
// ones auto-published. Not cached (route handlers aren't cached by default).
export async function GET(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const branches = await db.query.location.findMany({
    where: and(
      eq(location.googleReviewsAutoSync, true),
      isNotNull(location.googlePlaceId)
    ),
    columns: { id: true, slug: true, googlePlaceId: true },
  })

  const synced = await Promise.all(
    branches.map(
      async ({
        id,
        slug,
        googlePlaceId,
      }): Promise<{ slug: string } & ReviewSyncResult> => {
        if (!googlePlaceId)
          return { slug, ok: false, error: "missing-place-id" }
        try {
          return {
            slug,
            ...(await syncLocationReviews({
              locationId: id,
              placeId: googlePlaceId,
              autoPublish: true,
            })),
          }
        } catch (error) {
          return { slug, ok: false, error: (error as Error).message }
        }
      }
    )
  )

  // Refresh the public home page so newly published reviews show immediately.
  if (synced.some((result) => result.ok)) revalidatePath("/")

  return NextResponse.json({ synced })
}
