import { and, asc, eq, inArray, ne } from "drizzle-orm"
import { unstable_cache } from "next/cache"

import type { Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import { branch, priceRow, priceRowTranslation } from "@/lib/db/schema/content"

import {
  formatZodErrors,
  resolveLocalized,
  type ReadResult,
  type WriteResult,
} from "./_internal"
import {
  createPriceRowSchema,
  reorderSchema,
  updatePriceRowSchema,
  upsertPriceRowTranslationSchema,
} from "./schemas"
import { tags } from "./tags"

export type PriceKind = "hourly" | "adult" | "child" | "shoe"

export type PriceRowRead = {
  id: string
  kind: PriceKind
  weekdayAmountCents: number
  weekendAmountCents: number
  sortOrder: number
  label: string | null
}

type PriceRowRow = typeof priceRow.$inferSelect
type PriceRowTranslationRow = typeof priceRowTranslation.$inferSelect

async function loadByBranch(slug: string) {
  const rows = await db
    .select({ row: priceRow })
    .from(priceRow)
    .innerJoin(branch, eq(branch.id, priceRow.branchId))
    .where(eq(branch.slug, slug))
    .orderBy(asc(priceRow.sortOrder), asc(priceRow.kind))

  if (rows.length === 0) {
    return {
      rows: [] as PriceRowRow[],
      translations: [] as PriceRowTranslationRow[],
    }
  }

  const translations = await db
    .select()
    .from(priceRowTranslation)
    .where(
      inArray(
        priceRowTranslation.priceRowId,
        rows.map((r) => r.row.id)
      )
    )

  return { rows: rows.map((r) => r.row), translations }
}

function localizeRow(
  row: PriceRowRow,
  translations: PriceRowTranslationRow[],
  locale: Locale,
  pathPrefix: string
): ReadResult<PriceRowRead> {
  const resolved = resolveLocalized<{ label: string | null }>(
    translations.filter((t) => t.priceRowId === row.id),
    locale,
    ["label"],
    pathPrefix
  )
  return {
    data: {
      id: row.id,
      kind: row.kind as PriceKind,
      weekdayAmountCents: row.weekdayAmountCents,
      weekendAmountCents: row.weekendAmountCents,
      sortOrder: row.sortOrder,
      label: resolved.data.label,
    },
    needsReview: resolved.needsReview,
  }
}

export async function listByBranch(
  slug: string,
  locale: Locale
): Promise<ReadResult<PriceRowRead[]>> {
  const load = unstable_cache(
    () => loadByBranch(slug),
    ["prices:listByBranch", slug],
    { tags: [tags.branchPrices(slug), tags.branch(slug)] }
  )
  const { rows, translations } = await load()
  const nonShoe = rows.filter((r) => r.kind !== "shoe")
  const results = nonShoe.map((row, idx) =>
    localizeRow(row, translations, locale, String(idx))
  )
  return {
    data: results.map((r) => r.data),
    needsReview: results.flatMap((r) => r.needsReview),
  }
}

async function slugForPriceRow(id: string): Promise<string | null> {
  const [row] = await db
    .select({ slug: branch.slug })
    .from(priceRow)
    .innerJoin(branch, eq(branch.id, priceRow.branchId))
    .where(eq(priceRow.id, id))
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

function priceTags(slug: string) {
  return [tags.branchPrices(slug), tags.branch(slug)]
}

export async function create(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = createPriceRowSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  if (parsed.data.kind === "shoe") {
    const [existing] = await db
      .select({ id: priceRow.id })
      .from(priceRow)
      .where(
        and(
          eq(priceRow.branchId, parsed.data.branchId),
          eq(priceRow.kind, "shoe")
        )
      )
      .limit(1)
    if (existing) {
      return {
        ok: false,
        fieldErrors: { kind: ["shoe rental already exists for this branch"] },
      }
    }
  }
  const slug = await slugForBranchId(parsed.data.branchId)
  if (!slug)
    return { ok: false, fieldErrors: { branchId: ["branch not found"] } }

  const id = crypto.randomUUID()
  await db.insert(priceRow).values({
    id,
    branchId: parsed.data.branchId,
    kind: parsed.data.kind,
    weekdayAmountCents: parsed.data.weekdayAmountCents,
    weekendAmountCents: parsed.data.weekendAmountCents,
    sortOrder: parsed.data.sortOrder ?? 0,
  })
  return { ok: true, data: { id }, revalidateTags: priceTags(slug) }
}

export async function update(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = updatePriceRowSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const { id, ...rest } = parsed.data
  if (Object.keys(rest).length === 0) {
    return { ok: false, fieldErrors: { _: ["no fields to update"] } }
  }
  const slug = await slugForPriceRow(id)
  if (!slug) return { ok: false, fieldErrors: { id: ["price row not found"] } }

  if (rest.kind === "shoe") {
    const [existing] = await db
      .select({ id: priceRow.id, branchId: priceRow.branchId })
      .from(priceRow)
      .where(eq(priceRow.id, id))
      .limit(1)
    if (existing) {
      const [conflict] = await db
        .select({ id: priceRow.id })
        .from(priceRow)
        .where(
          and(
            eq(priceRow.branchId, existing.branchId),
            eq(priceRow.kind, "shoe"),
            ne(priceRow.id, id)
          )
        )
        .limit(1)
      if (conflict) {
        return {
          ok: false,
          fieldErrors: { kind: ["shoe rental already exists for this branch"] },
        }
      }
    }
  }

  await db.update(priceRow).set(rest).where(eq(priceRow.id, id))
  return { ok: true, data: { id }, revalidateTags: priceTags(slug) }
}

export async function remove(id: string): Promise<WriteResult<{ id: string }>> {
  const slug = await slugForPriceRow(id)
  if (!slug) return { ok: false, fieldErrors: { id: ["price row not found"] } }
  await db.delete(priceRow).where(eq(priceRow.id, id))
  return { ok: true, data: { id }, revalidateTags: priceTags(slug) }
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
        .update(priceRow)
        .set({ sortOrder: item.sortOrder })
        .where(and(eq(priceRow.id, item.id), eq(priceRow.branchId, branchId)))
    }
  })
  return {
    ok: true,
    data: { count: parsed.data.length },
    revalidateTags: priceTags(slug),
  }
}

export async function upsertTranslation(
  input: unknown
): Promise<WriteResult<{ priceRowId: string; locale: string }>> {
  const parsed = upsertPriceRowTranslationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForPriceRow(parsed.data.priceRowId)
  if (!slug) {
    return { ok: false, fieldErrors: { priceRowId: ["price row not found"] } }
  }
  const values = {
    priceRowId: parsed.data.priceRowId,
    locale: parsed.data.locale,
    label: parsed.data.label ?? null,
    aiGenerated: parsed.data.aiGenerated ?? false,
    aiGeneratedAt: parsed.data.aiGeneratedAt ?? null,
    reviewedAt: parsed.data.reviewedAt ?? null,
  }
  await db
    .insert(priceRowTranslation)
    .values(values)
    .onConflictDoUpdate({
      target: [priceRowTranslation.priceRowId, priceRowTranslation.locale],
      set: values,
    })
  return {
    ok: true,
    data: { priceRowId: parsed.data.priceRowId, locale: parsed.data.locale },
    revalidateTags: priceTags(slug),
  }
}
