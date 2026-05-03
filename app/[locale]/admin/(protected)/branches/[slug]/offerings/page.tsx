import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { asc, eq, inArray } from "drizzle-orm"

import { routing, type Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import {
  offeringPackage,
  offeringPackageTranslation,
  priceRow,
  priceRowTranslation,
} from "@/lib/db/schema/content"
import {
  BranchPackagesForm,
  type PackageFormRow,
} from "@/components/admin/branch/branch-packages-form"
import {
  BranchPricesForm,
  type PriceRowForm,
} from "@/components/admin/branch/branch-prices-form"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch offerings",
  robots: { index: false, follow: false },
}

export default async function BranchOfferingsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()
  const { row } = loaded

  const [priceRows, packageRows] = await Promise.all([
    db
      .select()
      .from(priceRow)
      .where(eq(priceRow.branchId, row.id))
      .orderBy(asc(priceRow.sortOrder)),
    db
      .select()
      .from(offeringPackage)
      .where(eq(offeringPackage.branchId, row.id))
      .orderBy(asc(offeringPackage.sortOrder)),
  ])

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
  const packageTranslationRows = packageRows.length
    ? await db
        .select()
        .from(offeringPackageTranslation)
        .where(
          inArray(
            offeringPackageTranslation.packageId,
            packageRows.map((p) => p.id)
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
      weekdayAmountCents: pr.weekdayAmountCents,
      weekendAmountCents: pr.weekendAmountCents,
      sortOrder: pr.sortOrder,
      translations: perLocale,
      needsReview: rowNeedsReview,
      aiGeneratedLocales: rowAiLocales,
    }
  })

  const packageInitial: PackageFormRow[] = packageRows.map((pkg) => {
    const perLocale = {} as PackageFormRow["translations"]
    for (const loc of routing.locales) {
      perLocale[loc] = { title: null, perks: null }
    }
    const pkgNeedsReview: string[] = []
    const pkgAiLocales: Locale[] = []
    for (const tr of packageTranslationRows) {
      if (tr.packageId !== pkg.id) continue
      const loc = tr.locale as Locale
      if (!routing.locales.includes(loc)) continue
      perLocale[loc] = { title: tr.title, perks: tr.perks }
      if (tr.aiGenerated && !tr.reviewedAt) {
        pkgAiLocales.push(loc)
        for (const field of ["title", "perks"] as const) {
          if (tr[field] !== null && tr[field] !== undefined) {
            pkgNeedsReview.push(`${field}.${loc}`)
          }
        }
      }
    }
    return {
      id: pkg.id,
      amountCents: pkg.amountCents,
      sortOrder: pkg.sortOrder,
      translations: perLocale,
      needsReview: pkgNeedsReview,
      aiGeneratedLocales: pkgAiLocales,
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <BranchPricesForm
        branchId={row.id}
        slug={row.slug}
        initialRows={priceInitial}
      />
      <BranchPackagesForm
        branchId={row.id}
        slug={row.slug}
        initialRows={packageInitial}
      />
    </div>
  )
}
