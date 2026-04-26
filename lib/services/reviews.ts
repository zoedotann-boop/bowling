import { and, desc, eq, isNotNull } from "drizzle-orm"

import { routing, type Locale } from "@/i18n/routing"
import { translateFields } from "@/lib/ai/translate"
import { db } from "@/lib/db"
import { branch, review, reviewCache } from "@/lib/db/schema/content"
import {
  getPlace,
  MissingGooglePlacesKeyError,
  type GoogleReview,
} from "@/lib/integrations/google-places"

import type { WriteResult } from "./_internal"
import { tags } from "./tags"

export type ReviewRead = {
  id: string
  authorName: string
  authorAvatarUrl: string | null
  rating: number
  publishedAt: Date
  text: string | null
  originalLocale: string | null
  aiTranslated: boolean
}

export type ReviewCacheStatus = {
  branchId: string
  placeName: string | null
  averageRating: number | null
  totalRatingCount: number | null
  fetchedAt: Date | null
}

const TARGET_LOCALES: readonly Locale[] = routing.locales

function readLocaleText(
  row: typeof review.$inferSelect,
  locale: Locale
): string | null {
  switch (locale) {
    case "he":
      return row.textHe
    case "en":
      return row.textEn
    case "ru":
      return row.textRu
    case "ar":
      return row.textAr
  }
}

export async function listForBranch(
  branchId: string,
  locale: Locale
): Promise<ReviewRead[]> {
  const rows = await db
    .select()
    .from(review)
    .where(eq(review.branchId, branchId))
    .orderBy(desc(review.publishedAt))

  return rows.map((row) => ({
    id: row.id,
    authorName: row.authorName,
    authorAvatarUrl: row.authorAvatarUrl,
    rating: row.rating,
    publishedAt: row.publishedAt,
    text: readLocaleText(row, locale) ?? row.textOriginal,
    originalLocale: row.originalLocale,
    aiTranslated: row.aiTranslated,
  }))
}

export async function getCacheStatus(
  branchId: string
): Promise<ReviewCacheStatus | null> {
  const [row] = await db
    .select()
    .from(reviewCache)
    .where(eq(reviewCache.branchId, branchId))
    .limit(1)
  if (!row) return null
  return {
    branchId: row.branchId,
    placeName: row.placeName,
    averageRating: row.averageRating,
    totalRatingCount: row.totalRatingCount,
    fetchedAt: row.fetchedAt,
  }
}

function sourceLocaleFromGoogle(code: string | undefined): Locale | null {
  if (!code) return null
  const lower = code.toLowerCase()
  const head = lower.split(/[-_]/)[0]
  if (head && (routing.locales as readonly string[]).includes(head)) {
    return head as Locale
  }
  return null
}

function pickSourceText(gr: GoogleReview): {
  text: string
  locale: Locale | null
} | null {
  const original = gr.originalText?.text?.trim()
  if (original) {
    return {
      text: original,
      locale: sourceLocaleFromGoogle(gr.originalText?.languageCode),
    }
  }
  const translated = gr.text?.text?.trim()
  if (translated) {
    return {
      text: translated,
      locale: sourceLocaleFromGoogle(gr.text?.languageCode),
    }
  }
  return null
}

async function translateReviewText(args: {
  text: string
  sourceLocale: Locale | null
}): Promise<Partial<Record<Locale, string>>> {
  const result: Partial<Record<Locale, string>> = {}
  const sourceLocale = args.sourceLocale
  if (sourceLocale) {
    result[sourceLocale] = args.text
  }

  const targets = TARGET_LOCALES.filter((l) => l !== sourceLocale)
  const translations = await Promise.allSettled(
    targets.map(async (target) => {
      const out = await translateFields({
        targetLocale: target,
        fields: { reviewText: args.text },
        domainHint: "customer review of a bowling alley",
      })
      return { target, text: out.reviewText }
    })
  )

  for (const entry of translations) {
    if (entry.status === "fulfilled" && entry.value.text) {
      result[entry.value.target] = entry.value.text
    } else if (entry.status === "rejected") {
      console.info({
        event: "review_translate_failed",
        reason:
          entry.reason instanceof Error
            ? entry.reason.message
            : String(entry.reason),
      })
    }
  }

  return result
}

export type SyncReviewsResult = {
  synced: number
  translated: number
  skipped: number
}

export async function syncBranch(
  branchId: string
): Promise<WriteResult<SyncReviewsResult>> {
  const [b] = await db
    .select({
      id: branch.id,
      slug: branch.slug,
      googlePlaceId: branch.googlePlaceId,
    })
    .from(branch)
    .where(eq(branch.id, branchId))
    .limit(1)

  if (!b) return { ok: false, fieldErrors: { branchId: ["branch not found"] } }
  if (!b.googlePlaceId) {
    return {
      ok: false,
      fieldErrors: { googlePlaceId: ["place id is not set on this branch"] },
    }
  }

  let place
  try {
    place = await getPlace(b.googlePlaceId)
  } catch (err) {
    if (err instanceof MissingGooglePlacesKeyError) {
      return {
        ok: false,
        fieldErrors: { _: ["GOOGLE_PLACES_API_KEY is not configured"] },
      }
    }
    throw err
  }

  const fetchedAt = new Date()

  await db
    .insert(reviewCache)
    .values({
      branchId: b.id,
      placeName: place.displayName?.text ?? null,
      totalRatingCount: place.userRatingCount ?? null,
      averageRating: place.rating ?? null,
      payload: place,
      fetchedAt,
    })
    .onConflictDoUpdate({
      target: reviewCache.branchId,
      set: {
        placeName: place.displayName?.text ?? null,
        totalRatingCount: place.userRatingCount ?? null,
        averageRating: place.rating ?? null,
        payload: place,
        fetchedAt,
      },
    })

  const remoteReviews = place.reviews ?? []
  let synced = 0
  let translated = 0
  let skipped = 0

  for (const gr of remoteReviews) {
    const googleReviewId = gr.name
    const source = pickSourceText(gr)

    const [existing] = await db
      .select()
      .from(review)
      .where(
        and(
          eq(review.branchId, b.id),
          eq(review.googleReviewId, googleReviewId)
        )
      )
      .limit(1)

    if (existing && source && existing.textOriginal === source.text) {
      await db
        .update(review)
        .set({
          authorName: gr.authorAttribution?.displayName ?? existing.authorName,
          authorAvatarUrl: gr.authorAttribution?.photoUri ?? null,
          rating: gr.rating,
          publishedAt: new Date(gr.publishTime),
          syncedAt: fetchedAt,
        })
        .where(eq(review.id, existing.id))
      skipped += 1
      continue
    }

    if (!source) {
      skipped += 1
      continue
    }

    const texts = await translateReviewText({
      text: source.text,
      sourceLocale: source.locale,
    })
    const aiTranslated = Object.keys(texts).some(
      (l) => l !== source.locale && texts[l as Locale]
    )

    const values = {
      branchId: b.id,
      googleReviewId,
      authorName: gr.authorAttribution?.displayName ?? "Anonymous",
      authorAvatarUrl: gr.authorAttribution?.photoUri ?? null,
      rating: gr.rating,
      publishedAt: new Date(gr.publishTime),
      originalLocale: source.locale,
      textOriginal: source.text,
      textHe: texts.he ?? null,
      textEn: texts.en ?? null,
      textRu: texts.ru ?? null,
      textAr: texts.ar ?? null,
      aiTranslated,
      aiTranslatedAt: aiTranslated ? new Date() : null,
      syncedAt: fetchedAt,
    }

    if (existing) {
      await db.update(review).set(values).where(eq(review.id, existing.id))
    } else {
      await db.insert(review).values({ id: crypto.randomUUID(), ...values })
    }

    synced += 1
    if (aiTranslated) translated += 1
  }

  console.info({
    event: "reviews_sync_complete",
    branch: b.slug,
    synced,
    translated,
    skipped,
    totalRemote: remoteReviews.length,
  })

  return {
    ok: true,
    data: { synced, translated, skipped },
    revalidateTags: [tags.branch(b.slug), tags.branchReviews(b.slug)],
  }
}

/** @public Used by cron route handler. */
export async function listBranchesWithPlaceId(): Promise<
  { id: string; slug: string }[]
> {
  return db
    .select({ id: branch.id, slug: branch.slug })
    .from(branch)
    .where(isNotNull(branch.googlePlaceId))
}
