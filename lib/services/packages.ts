import { and, asc, eq, inArray } from "drizzle-orm"
import { unstable_cache } from "next/cache"

import type { Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import {
  branch,
  offeringPackage,
  offeringPackageTranslation,
} from "@/lib/db/schema/content"

import { formatZodErrors } from "./errors"
import { resolveLocalized } from "./locale"
import {
  createOfferingPackageSchema,
  reorderSchema,
  updateOfferingPackageSchema,
  upsertOfferingPackageTranslationSchema,
} from "./schemas"
import { tags } from "./tags"
import type { ReadResult, WriteResult } from "./types"

export type PackageRead = {
  id: string
  amountCents: number
  sortOrder: number
  title: string | null
  perks: string | null
}

type PackageRow = typeof offeringPackage.$inferSelect
type PackageTranslationRow = typeof offeringPackageTranslation.$inferSelect

export async function listByBranch(
  slug: string,
  locale: Locale
): Promise<ReadResult<PackageRead[]>> {
  const load = unstable_cache(
    async () => {
      const rows = await db
        .select({ row: offeringPackage })
        .from(offeringPackage)
        .innerJoin(branch, eq(branch.id, offeringPackage.branchId))
        .where(eq(branch.slug, slug))
        .orderBy(asc(offeringPackage.sortOrder))

      if (rows.length === 0) {
        return {
          rows: [] as PackageRow[],
          translations: [] as PackageTranslationRow[],
        }
      }
      const translations = await db
        .select()
        .from(offeringPackageTranslation)
        .where(
          inArray(
            offeringPackageTranslation.packageId,
            rows.map((r) => r.row.id)
          )
        )
      return { rows: rows.map((r) => r.row), translations }
    },
    ["packages:listByBranch", slug],
    { tags: [tags.branchPackages(slug), tags.branch(slug)] }
  )
  const { rows, translations } = await load()

  const results = rows.map((row, idx) => {
    const resolved = resolveLocalized<{
      title: string | null
      perks: string | null
    }>(
      translations.filter((t) => t.packageId === row.id),
      locale,
      ["title", "perks"],
      String(idx)
    )
    return {
      data: {
        id: row.id,
        amountCents: row.amountCents,
        sortOrder: row.sortOrder,
        title: resolved.data.title,
        perks: resolved.data.perks,
      } satisfies PackageRead,
      needsReview: resolved.needsReview,
    }
  })
  return {
    data: results.map((r) => r.data),
    needsReview: results.flatMap((r) => r.needsReview),
  }
}

async function slugForPackage(id: string): Promise<string | null> {
  const [row] = await db
    .select({ slug: branch.slug })
    .from(offeringPackage)
    .innerJoin(branch, eq(branch.id, offeringPackage.branchId))
    .where(eq(offeringPackage.id, id))
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

function packageTags(slug: string) {
  return [tags.branchPackages(slug), tags.branch(slug)]
}

export async function create(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = createOfferingPackageSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForBranchId(parsed.data.branchId)
  if (!slug)
    return { ok: false, fieldErrors: { branchId: ["branch not found"] } }
  const id = crypto.randomUUID()
  await db.insert(offeringPackage).values({
    id,
    branchId: parsed.data.branchId,
    amountCents: parsed.data.amountCents,
    sortOrder: parsed.data.sortOrder ?? 0,
  })
  return { ok: true, data: { id }, revalidateTags: packageTags(slug) }
}

export async function update(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = updateOfferingPackageSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const { id, ...rest } = parsed.data
  if (Object.keys(rest).length === 0) {
    return { ok: false, fieldErrors: { _: ["no fields to update"] } }
  }
  const slug = await slugForPackage(id)
  if (!slug) return { ok: false, fieldErrors: { id: ["package not found"] } }
  await db.update(offeringPackage).set(rest).where(eq(offeringPackage.id, id))
  return { ok: true, data: { id }, revalidateTags: packageTags(slug) }
}

export async function remove(id: string): Promise<WriteResult<{ id: string }>> {
  const slug = await slugForPackage(id)
  if (!slug) return { ok: false, fieldErrors: { id: ["package not found"] } }
  await db.delete(offeringPackage).where(eq(offeringPackage.id, id))
  return { ok: true, data: { id }, revalidateTags: packageTags(slug) }
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
        .update(offeringPackage)
        .set({ sortOrder: item.sortOrder })
        .where(
          and(
            eq(offeringPackage.id, item.id),
            eq(offeringPackage.branchId, branchId)
          )
        )
    }
  })
  return {
    ok: true,
    data: { count: parsed.data.length },
    revalidateTags: packageTags(slug),
  }
}

export async function upsertTranslation(
  input: unknown
): Promise<WriteResult<{ packageId: string; locale: string }>> {
  const parsed = upsertOfferingPackageTranslationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForPackage(parsed.data.packageId)
  if (!slug) {
    return { ok: false, fieldErrors: { packageId: ["package not found"] } }
  }
  const values = {
    packageId: parsed.data.packageId,
    locale: parsed.data.locale,
    title: parsed.data.title ?? null,
    perks: parsed.data.perks ?? null,
    aiGenerated: parsed.data.aiGenerated ?? false,
    aiGeneratedAt: parsed.data.aiGeneratedAt ?? null,
    reviewedAt: parsed.data.reviewedAt ?? null,
  }
  await db
    .insert(offeringPackageTranslation)
    .values(values)
    .onConflictDoUpdate({
      target: [
        offeringPackageTranslation.packageId,
        offeringPackageTranslation.locale,
      ],
      set: values,
    })
  return {
    ok: true,
    data: { packageId: parsed.data.packageId, locale: parsed.data.locale },
    revalidateTags: packageTags(slug),
  }
}
