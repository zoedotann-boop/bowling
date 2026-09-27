import { and, eq, isNotNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"
import {
  syncLocationReviews,
  type ReviewSyncResult,
} from "@/lib/google/sync-reviews"

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

  if (synced.some((result) => result.ok)) revalidatePath("/")

  return NextResponse.json({ synced })
}
