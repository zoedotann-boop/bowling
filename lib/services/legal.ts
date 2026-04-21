import { and, asc, eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"

import type { Locale } from "@/i18n/routing"
import { routing } from "@/i18n/routing"
import { db } from "@/lib/db"
import { legalPage } from "@/lib/db/schema/content"

import { formatZodErrors } from "./errors"
import { upsertLegalPageSchema } from "./schemas"
import { tags } from "./tags"
import type { WriteResult } from "./types"

export type LegalPageRow = typeof legalPage.$inferSelect

export type LegalPageAdmin = {
  branchId: string
  slug: string
  titleHe: string | null
  titleEn: string | null
  titleRu: string | null
  titleAr: string | null
  bodyMarkdownHe: string | null
  bodyMarkdownEn: string | null
  bodyMarkdownRu: string | null
  bodyMarkdownAr: string | null
  published: boolean
  sortOrder: number
}

export type LegalPageLocalized = {
  slug: string
  title: string | null
  bodyMarkdown: string | null
  published: boolean
}

function toAdmin(row: LegalPageRow): LegalPageAdmin {
  return {
    branchId: row.branchId,
    slug: row.slug,
    titleHe: row.titleHe,
    titleEn: row.titleEn,
    titleRu: row.titleRu,
    titleAr: row.titleAr,
    bodyMarkdownHe: row.bodyMarkdownHe,
    bodyMarkdownEn: row.bodyMarkdownEn,
    bodyMarkdownRu: row.bodyMarkdownRu,
    bodyMarkdownAr: row.bodyMarkdownAr,
    published: row.published,
    sortOrder: row.sortOrder,
  }
}

const TITLE_COLS = {
  he: "titleHe",
  en: "titleEn",
  ru: "titleRu",
  ar: "titleAr",
} as const satisfies Record<Locale, keyof LegalPageRow>

const BODY_COLS = {
  he: "bodyMarkdownHe",
  en: "bodyMarkdownEn",
  ru: "bodyMarkdownRu",
  ar: "bodyMarkdownAr",
} as const satisfies Record<Locale, keyof LegalPageRow>

function pickTitle(row: LegalPageRow, locale: Locale): string | null {
  const value = row[TITLE_COLS[locale]] as string | null
  if (value && value.trim().length > 0) return value
  const fallback = row[TITLE_COLS[routing.defaultLocale]] as string | null
  return fallback && fallback.trim().length > 0 ? fallback : null
}

function pickBody(row: LegalPageRow, locale: Locale): string | null {
  const value = row[BODY_COLS[locale]] as string | null
  if (value && value.trim().length > 0) return value
  const fallback = row[BODY_COLS[routing.defaultLocale]] as string | null
  return fallback && fallback.trim().length > 0 ? fallback : null
}

export async function listByBranch(
  branchId: string
): Promise<LegalPageAdmin[]> {
  const rows = await db
    .select()
    .from(legalPage)
    .where(eq(legalPage.branchId, branchId))
    .orderBy(asc(legalPage.sortOrder), asc(legalPage.slug))
  return rows.map(toAdmin)
}

export async function getBySlug(
  slug: string,
  locale: Locale
): Promise<LegalPageLocalized | null> {
  const load = unstable_cache(async () => {
    const [row] = await db
      .select()
      .from(legalPage)
      .where(and(eq(legalPage.slug, slug), eq(legalPage.published, true)))
      .orderBy(asc(legalPage.sortOrder))
      .limit(1)
    return row ?? null
  }, ["legal:getBySlug", slug])
  const row = await load()
  if (!row || !row.published) return null
  return {
    slug: row.slug,
    title: pickTitle(row, locale),
    bodyMarkdown: pickBody(row, locale),
    published: row.published,
  }
}

export async function listPublished(): Promise<
  { slug: string; sortOrder: number }[]
> {
  const load = unstable_cache(async () => {
    const rows = await db
      .select({ slug: legalPage.slug, sortOrder: legalPage.sortOrder })
      .from(legalPage)
      .where(eq(legalPage.published, true))
      .orderBy(asc(legalPage.sortOrder), asc(legalPage.slug))
    const bySlug = new Map<string, number>()
    for (const r of rows) {
      if (!bySlug.has(r.slug)) bySlug.set(r.slug, r.sortOrder)
    }
    return Array.from(bySlug, ([slug, sortOrder]) => ({ slug, sortOrder }))
  }, ["legal:listPublished"])
  return load()
}

export async function upsert(
  input: unknown
): Promise<WriteResult<LegalPageAdmin>> {
  const parsed = upsertLegalPageSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const values = {
    branchId: parsed.data.branchId,
    slug: parsed.data.slug,
    titleHe: parsed.data.titleHe ?? null,
    titleEn: parsed.data.titleEn ?? null,
    titleRu: parsed.data.titleRu ?? null,
    titleAr: parsed.data.titleAr ?? null,
    bodyMarkdownHe: parsed.data.bodyMarkdownHe ?? null,
    bodyMarkdownEn: parsed.data.bodyMarkdownEn ?? null,
    bodyMarkdownRu: parsed.data.bodyMarkdownRu ?? null,
    bodyMarkdownAr: parsed.data.bodyMarkdownAr ?? null,
    published: parsed.data.published ?? true,
    sortOrder: parsed.data.sortOrder ?? 0,
  }
  const [row] = await db
    .insert(legalPage)
    .values(values)
    .onConflictDoUpdate({
      target: [legalPage.branchId, legalPage.slug],
      set: values,
    })
    .returning()
  return {
    ok: true,
    data: toAdmin(row!),
    revalidateTags: [
      tags.legalBranch(parsed.data.branchId),
      tags.legal(parsed.data.branchId, parsed.data.slug),
    ],
  }
}

export async function remove(
  branchId: string,
  slug: string
): Promise<WriteResult<{ slug: string }>> {
  const [row] = await db
    .delete(legalPage)
    .where(and(eq(legalPage.branchId, branchId), eq(legalPage.slug, slug)))
    .returning({ slug: legalPage.slug })
  if (!row) return { ok: false, fieldErrors: { slug: ["not found"] } }
  return {
    ok: true,
    data: { slug: row.slug },
    revalidateTags: [tags.legalBranch(branchId), tags.legal(branchId, slug)],
  }
}
