import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { asc, eq, inArray } from "drizzle-orm"

import { routing, type Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import { priceRow, priceRowTranslation } from "@/lib/db/schema/content"
import {
  BranchPricesForm,
  type PriceKind,
  type PriceRowForm,
} from "@/components/admin/branch/branch-prices-form"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch prices",
  robots: { index: false, follow: false },
}

export default async function BranchPricesPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()
  const { row } = loaded

  const priceRows = await db
    .select()
    .from(priceRow)
    .where(eq(priceRow.branchId, row.id))
    .orderBy(asc(priceRow.sortOrder))
  const priceTranslationRows = priceRows.length
    ? await db
        .select()
        .from(priceRowTranslation)
        .where(
          inArray(
            priceRowTranslation.priceRowId,
            priceRows.map((p) => p.id)
          )
        )
    : []
  const priceInitial: PriceRowForm[] = priceRows.map((pr) => {
    const perLocale = {} as PriceRowForm["translations"]
    for (const loc of routing.locales) {
      perLocale[loc] = { label: null }
    }
    const rowNeedsReview: string[] = []
    const rowAiLocales: Locale[] = []
    for (const tr of priceTranslationRows) {
      if (tr.priceRowId !== pr.id) continue
      const loc = tr.locale as Locale
      if (!routing.locales.includes(loc)) continue
      perLocale[loc] = { label: tr.label }
      if (tr.aiGenerated && !tr.reviewedAt) {
        rowAiLocales.push(loc)
        if (tr.label !== null && tr.label !== undefined) {
          rowNeedsReview.push(`label.${loc}`)
        }
      }
    }
    return {
      id: pr.id,
      kind: pr.kind as PriceKind,
      weekdayAmountCents: pr.weekdayAmountCents,
      weekendAmountCents: pr.weekendAmountCents,
      sortOrder: pr.sortOrder,
      translations: perLocale,
      needsReview: rowNeedsReview,
      aiGeneratedLocales: rowAiLocales,
    }
  })

  return (
    <BranchPricesForm
      branchId={row.id}
      slug={row.slug}
      initialRows={priceInitial}
    />
  )
}
