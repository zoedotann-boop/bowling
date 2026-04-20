import { and, asc, eq, inArray } from "drizzle-orm"
import { unstable_cache } from "next/cache"

import type { Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import {
  branch,
  eventOffering,
  eventOfferingTranslation,
} from "@/lib/db/schema/content"
import { mediaAsset } from "@/lib/db/schema/media"

import { formatZodErrors } from "./errors"
import { resolveLocalized } from "./locale"
import {
  createEventOfferingSchema,
  reorderSchema,
  updateEventOfferingSchema,
  upsertEventOfferingTranslationSchema,
} from "./schemas"
import { tags } from "./tags"
import type { ReadResult, WriteResult } from "./types"

export type EventRead = {
  id: string
  image: { id: string; blobUrl: string } | null
  sortOrder: number
  title: string | null
  description: string | null
}

type EventRow = typeof eventOffering.$inferSelect
type EventTranslationRow = typeof eventOfferingTranslation.$inferSelect

export async function listByBranch(
  slug: string,
  locale: Locale
): Promise<ReadResult<EventRead[]>> {
  const load = unstable_cache(
    async () => {
      const rows = await db
        .select({ row: eventOffering, imageBlobUrl: mediaAsset.blobUrl })
        .from(eventOffering)
        .innerJoin(branch, eq(branch.id, eventOffering.branchId))
        .leftJoin(mediaAsset, eq(mediaAsset.id, eventOffering.imageId))
        .where(eq(branch.slug, slug))
        .orderBy(asc(eventOffering.sortOrder))

      if (rows.length === 0) {
        return {
          rows: [] as {
            row: EventRow
            imageBlobUrl: string | null
          }[],
          translations: [] as EventTranslationRow[],
        }
      }
      const translations = await db
        .select()
        .from(eventOfferingTranslation)
        .where(
          inArray(
            eventOfferingTranslation.eventOfferingId,
            rows.map((r) => r.row.id)
          )
        )
      return { rows, translations }
    },
    ["events:listByBranch", slug],
    { tags: [tags.branchEvents(slug), tags.branch(slug)] }
  )
  const { rows, translations } = await load()

  const results = rows.map(({ row, imageBlobUrl }, idx) => {
    const resolved = resolveLocalized<{
      title: string | null
      description: string | null
    }>(
      translations.filter((t) => t.eventOfferingId === row.id),
      locale,
      ["title", "description"],
      String(idx)
    )
    return {
      data: {
        id: row.id,
        image:
          row.imageId && imageBlobUrl
            ? { id: row.imageId, blobUrl: imageBlobUrl }
            : null,
        sortOrder: row.sortOrder,
        title: resolved.data.title,
        description: resolved.data.description,
      } satisfies EventRead,
      needsReview: resolved.needsReview,
    }
  })
  return {
    data: results.map((r) => r.data),
    needsReview: results.flatMap((r) => r.needsReview),
  }
}

async function slugForEvent(id: string): Promise<string | null> {
  const [row] = await db
    .select({ slug: branch.slug })
    .from(eventOffering)
    .innerJoin(branch, eq(branch.id, eventOffering.branchId))
    .where(eq(eventOffering.id, id))
    .limit(1)
  return row?.slug ?? null
}

async function slugForBranchId(branchId: string): Promise<string | null> {
  const [row] = await db
    .select({ slug: branch.slug })
    .from(branch)
    .where(eq(branch.id, branchId))
    .limit(1)
  return row?.slug ?? null
}

function eventTags(slug: string) {
  return [tags.branchEvents(slug), tags.branch(slug)]
}

export async function create(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = createEventOfferingSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForBranchId(parsed.data.branchId)
  if (!slug)
    return { ok: false, fieldErrors: { branchId: ["branch not found"] } }
  const id = crypto.randomUUID()
  await db.insert(eventOffering).values({
    id,
    branchId: parsed.data.branchId,
    imageId: parsed.data.imageId ?? null,
    sortOrder: parsed.data.sortOrder ?? 0,
  })
  return { ok: true, data: { id }, revalidateTags: eventTags(slug) }
}

export async function update(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = updateEventOfferingSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const { id, ...rest } = parsed.data
  if (Object.keys(rest).length === 0) {
    return { ok: false, fieldErrors: { _: ["no fields to update"] } }
  }
  const slug = await slugForEvent(id)
  if (!slug) return { ok: false, fieldErrors: { id: ["event not found"] } }
  await db.update(eventOffering).set(rest).where(eq(eventOffering.id, id))
  return { ok: true, data: { id }, revalidateTags: eventTags(slug) }
}

export async function remove(id: string): Promise<WriteResult<{ id: string }>> {
  const slug = await slugForEvent(id)
  if (!slug) return { ok: false, fieldErrors: { id: ["event not found"] } }
  await db.delete(eventOffering).where(eq(eventOffering.id, id))
  return { ok: true, data: { id }, revalidateTags: eventTags(slug) }
}

export async function reorder(
  branchId: string,
  items: unknown
): Promise<WriteResult<{ count: number }>> {
  const parsed = reorderSchema.safeParse(items)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForBranchId(branchId)
  if (!slug)
    return { ok: false, fieldErrors: { branchId: ["branch not found"] } }
  await db.transaction(async (tx) => {
    for (const item of parsed.data) {
      await tx
        .update(eventOffering)
        .set({ sortOrder: item.sortOrder })
        .where(
          and(
            eq(eventOffering.id, item.id),
            eq(eventOffering.branchId, branchId)
          )
        )
    }
  })
  return {
    ok: true,
    data: { count: parsed.data.length },
    revalidateTags: eventTags(slug),
  }
}

export async function upsertTranslation(
  input: unknown
): Promise<WriteResult<{ eventOfferingId: string; locale: string }>> {
  const parsed = upsertEventOfferingTranslationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForEvent(parsed.data.eventOfferingId)
  if (!slug) {
    return {
      ok: false,
      fieldErrors: { eventOfferingId: ["event not found"] },
    }
  }
  const values = {
    eventOfferingId: parsed.data.eventOfferingId,
    locale: parsed.data.locale,
    title: parsed.data.title ?? null,
    description: parsed.data.description ?? null,
    aiGenerated: parsed.data.aiGenerated ?? false,
    aiGeneratedAt: parsed.data.aiGeneratedAt ?? null,
    reviewedAt: parsed.data.reviewedAt ?? null,
  }
  await db
    .insert(eventOfferingTranslation)
    .values(values)
    .onConflictDoUpdate({
      target: [
        eventOfferingTranslation.eventOfferingId,
        eventOfferingTranslation.locale,
      ],
      set: values,
    })
  return {
    ok: true,
    data: {
      eventOfferingId: parsed.data.eventOfferingId,
      locale: parsed.data.locale,
    },
    revalidateTags: eventTags(slug),
  }
}
