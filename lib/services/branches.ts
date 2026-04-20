import { asc, eq, inArray } from "drizzle-orm"
import { unstable_cache } from "next/cache"

import type { Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import { branch, branchTranslation } from "@/lib/db/schema/content"
import { mediaAsset } from "@/lib/db/schema/media"

import { formatZodErrors } from "./errors"
import { resolveLocalized } from "./locale"
import {
  createBranchSchema,
  reorderSchema,
  setBranchPublishedSchema,
  updateBranchSchema,
  upsertBranchTranslationSchema,
} from "./schemas"
import { tags } from "./tags"
import type { ReadResult, WriteResult } from "./types"

export type BranchAccent = "cherry" | "teal"

export type BranchRead = {
  id: string
  slug: string
  phone: string
  whatsapp: string
  email: string
  mapUrl: string
  latitude: number
  longitude: number
  brandAccent: BranchAccent
  heroImage: { id: string; blobUrl: string } | null
  googlePlaceId: string | null
  published: boolean
  sortOrder: number
  displayName: string | null
  shortName: string | null
  address: string | null
  city: string | null
  heroHeadline: string | null
  heroTagline: string | null
  seoTitle: string | null
  seoDescription: string | null
}

const TRANSLATION_FIELDS = [
  "displayName",
  "shortName",
  "address",
  "city",
  "heroHeadline",
  "heroTagline",
  "seoTitle",
  "seoDescription",
] as const

type BranchRow = typeof branch.$inferSelect
type TranslationRow = typeof branchTranslation.$inferSelect
type LoadedBranch = {
  row: BranchRow
  heroImage: { id: string; blobUrl: string } | null
  translations: TranslationRow[]
}

async function loadBranch(slug: string): Promise<LoadedBranch | null> {
  const [joined] = await db
    .select({
      row: branch,
      heroBlobUrl: mediaAsset.blobUrl,
    })
    .from(branch)
    .leftJoin(mediaAsset, eq(mediaAsset.id, branch.heroImageId))
    .where(eq(branch.slug, slug))
    .limit(1)

  if (!joined) return null

  const translations = await db
    .select()
    .from(branchTranslation)
    .where(eq(branchTranslation.branchId, joined.row.id))

  return {
    row: joined.row,
    heroImage:
      joined.row.heroImageId && joined.heroBlobUrl
        ? { id: joined.row.heroImageId, blobUrl: joined.heroBlobUrl }
        : null,
    translations,
  }
}

function localize(
  loaded: LoadedBranch,
  locale: Locale
): ReadResult<BranchRead> {
  const resolved = resolveLocalized<{
    displayName: string | null
    shortName: string | null
    address: string | null
    city: string | null
    heroHeadline: string | null
    heroTagline: string | null
    seoTitle: string | null
    seoDescription: string | null
  }>(loaded.translations, locale, TRANSLATION_FIELDS)

  return {
    data: {
      id: loaded.row.id,
      slug: loaded.row.slug,
      phone: loaded.row.phone,
      whatsapp: loaded.row.whatsapp,
      email: loaded.row.email,
      mapUrl: loaded.row.mapUrl,
      latitude: loaded.row.latitude,
      longitude: loaded.row.longitude,
      brandAccent: loaded.row.brandAccent as BranchAccent,
      heroImage: loaded.heroImage,
      googlePlaceId: loaded.row.googlePlaceId,
      published: loaded.row.published,
      sortOrder: loaded.row.sortOrder,
      ...resolved.data,
    },
    needsReview: resolved.needsReview,
  }
}

/** @public Consumed in sub-project H when public site cuts over to services. */
export async function getBySlug(
  slug: string,
  locale: Locale
): Promise<ReadResult<BranchRead> | null> {
  const load = unstable_cache(
    () => loadBranch(slug),
    ["branches:getBySlug", slug],
    { tags: [tags.branch(slug), tags.branchAll()] }
  )
  const loaded = await load()
  return loaded ? localize(loaded, locale) : null
}

export async function list(locale: Locale): Promise<ReadResult<BranchRead[]>> {
  const load = unstable_cache(
    async () => {
      const rows = await db
        .select({
          row: branch,
          heroBlobUrl: mediaAsset.blobUrl,
        })
        .from(branch)
        .leftJoin(mediaAsset, eq(mediaAsset.id, branch.heroImageId))
        .orderBy(asc(branch.sortOrder), asc(branch.slug))

      if (rows.length === 0) return []

      const translations = await db
        .select()
        .from(branchTranslation)
        .where(
          inArray(
            branchTranslation.branchId,
            rows.map((r) => r.row.id)
          )
        )

      const byBranch = new Map<string, TranslationRow[]>()
      for (const t of translations) {
        const list = byBranch.get(t.branchId) ?? []
        list.push(t)
        byBranch.set(t.branchId, list)
      }

      return rows.map<LoadedBranch>((r) => ({
        row: r.row,
        heroImage:
          r.row.heroImageId && r.heroBlobUrl
            ? { id: r.row.heroImageId, blobUrl: r.heroBlobUrl }
            : null,
        translations: byBranch.get(r.row.id) ?? [],
      }))
    },
    ["branches:list"],
    { tags: [tags.branchAll()] }
  )
  const loaded = await load()

  const results = loaded.map((l, idx) => {
    const res = localize(l, locale)
    return {
      data: res.data,
      needsReview: res.needsReview.map((p) => `${idx}.${p}`),
    }
  })

  return {
    data: results.map((r) => r.data),
    needsReview: results.flatMap((r) => r.needsReview),
  }
}

// ---------- Mutations ----------

export async function create(
  input: unknown
): Promise<WriteResult<{ id: string; slug: string }>> {
  const parsed = createBranchSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const id = crypto.randomUUID()
  const [row] = await db
    .insert(branch)
    .values({
      id,
      slug: parsed.data.slug,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      email: parsed.data.email,
      mapUrl: parsed.data.mapUrl,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      brandAccent: parsed.data.brandAccent,
      heroImageId: parsed.data.heroImageId ?? null,
      googlePlaceId: parsed.data.googlePlaceId ?? null,
      published: parsed.data.published ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning({ id: branch.id, slug: branch.slug })
  return {
    ok: true,
    data: row!,
    revalidateTags: [tags.branchAll(), tags.branch(row!.slug)],
  }
}

export async function update(
  input: unknown
): Promise<WriteResult<{ id: string; slug: string }>> {
  const parsed = updateBranchSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const { id, ...rest } = parsed.data
  if (Object.keys(rest).length === 0) {
    return { ok: false, fieldErrors: { _: ["no fields to update"] } }
  }
  const [row] = await db
    .update(branch)
    .set(rest)
    .where(eq(branch.id, id))
    .returning({ id: branch.id, slug: branch.slug })
  if (!row) return { ok: false, fieldErrors: { id: ["branch not found"] } }
  return {
    ok: true,
    data: row,
    revalidateTags: [tags.branchAll(), tags.branch(row.slug)],
  }
}

export async function setPublished(
  input: unknown
): Promise<WriteResult<{ id: string; slug: string; published: boolean }>> {
  const parsed = setBranchPublishedSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const [row] = await db
    .update(branch)
    .set({ published: parsed.data.published })
    .where(eq(branch.id, parsed.data.id))
    .returning({
      id: branch.id,
      slug: branch.slug,
      published: branch.published,
    })
  if (!row) return { ok: false, fieldErrors: { id: ["branch not found"] } }
  return {
    ok: true,
    data: row,
    revalidateTags: [tags.branchAll(), tags.branch(row.slug)],
  }
}

export async function reorder(
  input: unknown
): Promise<WriteResult<{ count: number }>> {
  const parsed = reorderSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  await db.transaction(async (tx) => {
    for (const item of parsed.data) {
      await tx
        .update(branch)
        .set({ sortOrder: item.sortOrder })
        .where(eq(branch.id, item.id))
    }
  })
  return {
    ok: true,
    data: { count: parsed.data.length },
    revalidateTags: [tags.branchAll()],
  }
}

export async function remove(id: string): Promise<WriteResult<{ id: string }>> {
  const [row] = await db
    .delete(branch)
    .where(eq(branch.id, id))
    .returning({ id: branch.id, slug: branch.slug })
  if (!row) return { ok: false, fieldErrors: { id: ["branch not found"] } }
  return {
    ok: true,
    data: { id: row.id },
    revalidateTags: [tags.branchAll(), tags.branch(row.slug)],
  }
}

export async function upsertTranslation(
  input: unknown
): Promise<WriteResult<{ branchId: string; locale: string }>> {
  const parsed = upsertBranchTranslationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const [owner] = await db
    .select({ slug: branch.slug })
    .from(branch)
    .where(eq(branch.id, parsed.data.branchId))
    .limit(1)
  if (!owner) {
    return { ok: false, fieldErrors: { branchId: ["branch not found"] } }
  }

  const values = {
    branchId: parsed.data.branchId,
    locale: parsed.data.locale,
    displayName: parsed.data.displayName ?? null,
    shortName: parsed.data.shortName ?? null,
    address: parsed.data.address ?? null,
    city: parsed.data.city ?? null,
    heroHeadline: parsed.data.heroHeadline ?? null,
    heroTagline: parsed.data.heroTagline ?? null,
    seoTitle: parsed.data.seoTitle ?? null,
    seoDescription: parsed.data.seoDescription ?? null,
    aiGenerated: parsed.data.aiGenerated ?? false,
    aiGeneratedAt: parsed.data.aiGeneratedAt ?? null,
    reviewedAt: parsed.data.reviewedAt ?? null,
  }

  await db
    .insert(branchTranslation)
    .values(values)
    .onConflictDoUpdate({
      target: [branchTranslation.branchId, branchTranslation.locale],
      set: values,
    })

  return {
    ok: true,
    data: { branchId: parsed.data.branchId, locale: parsed.data.locale },
    revalidateTags: [tags.branchAll(), tags.branch(owner.slug)],
  }
}
