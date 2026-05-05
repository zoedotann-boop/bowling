import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { asc, eq, inArray } from "drizzle-orm"
import { getTranslations } from "next-intl/server"

import { routing, type Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import {
  menuCategory,
  menuCategoryTranslation,
  menuItem,
  menuItemTranslation,
  offeringPackage,
  offeringPackageTranslation,
  priceRow,
  priceRowTranslation,
} from "@/lib/db/schema/content"
import { PageHeader } from "@/components/admin/shared/page-header"
import {
  BranchMenuForm,
  type MenuCategoryFormRow,
  type MenuItemFormRow,
} from "@/components/admin/branch/branch-menu-form"
import {
  BranchPackagesForm,
  type PackageFormRow,
} from "@/components/admin/branch/branch-packages-form"
import {
  BranchPricesForm,
  type PriceRowForm,
} from "@/components/admin/branch/branch-prices-form"
import { PricelistsTabs } from "./pricelists-tabs"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Pricelists",
  robots: { index: false, follow: false },
}

export default async function PricelistsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()
  const { row } = loaded

  const t = await getTranslations({ locale, namespace: "Admin.pricelists" })

  const [priceRows, packageRows, categoryRows] = await Promise.all([
    db
      .select()
      .from(priceRow)
      .where(eq(priceRow.branchId, row.id))
      .orderBy(asc(priceRow.sortOrder), asc(priceRow.id)),
    db
      .select()
      .from(offeringPackage)
      .where(eq(offeringPackage.branchId, row.id))
      .orderBy(asc(offeringPackage.sortOrder), asc(offeringPackage.id)),
    db
      .select()
      .from(menuCategory)
      .where(eq(menuCategory.branchId, row.id))
      .orderBy(asc(menuCategory.sortOrder)),
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

  const categoryIds = categoryRows.map((c) => c.id)
  const [categoryTranslationRows, itemRows] = categoryIds.length
    ? await Promise.all([
        db
          .select()
          .from(menuCategoryTranslation)
          .where(inArray(menuCategoryTranslation.menuCategoryId, categoryIds)),
        db
          .select()
          .from(menuItem)
          .where(inArray(menuItem.categoryId, categoryIds))
          .orderBy(asc(menuItem.categoryId), asc(menuItem.sortOrder)),
      ])
    : [
        [] as (typeof menuCategoryTranslation.$inferSelect)[],
        [] as (typeof menuItem.$inferSelect)[],
      ]
  const itemTranslationRows = itemRows.length
    ? await db
        .select()
        .from(menuItemTranslation)
        .where(
          inArray(
            menuItemTranslation.menuItemId,
            itemRows.map((i) => i.id)
          )
        )
    : []

  const priceInitial: PriceRowForm[] = priceRows.map((pr) => {
    const perLocale = {} as PriceRowForm["translations"]
    for (const loc of routing.locales) perLocale[loc] = { label: null }
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
    for (const loc of routing.locales)
      perLocale[loc] = { title: null, perks: null }
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

  const menuInitial: MenuCategoryFormRow[] = categoryRows.map((cat) => {
    const perLocale = {} as MenuCategoryFormRow["translations"]
    for (const loc of routing.locales) perLocale[loc] = { title: null }
    const catNeedsReview: string[] = []
    const catAiLocales: Locale[] = []
    for (const tr of categoryTranslationRows) {
      if (tr.menuCategoryId !== cat.id) continue
      const loc = tr.locale as Locale
      if (!routing.locales.includes(loc)) continue
      perLocale[loc] = { title: tr.title }
      if (tr.aiGenerated && !tr.reviewedAt) {
        catAiLocales.push(loc)
        if (tr.title !== null && tr.title !== undefined) {
          catNeedsReview.push(`title.${loc}`)
        }
      }
    }
    const items: MenuItemFormRow[] = itemRows
      .filter((i) => i.categoryId === cat.id)
      .map((item) => {
        const itemPerLocale = {} as MenuItemFormRow["translations"]
        for (const loc of routing.locales)
          itemPerLocale[loc] = { name: null, tag: null }
        const itemNeedsReview: string[] = []
        const itemAiLocales: Locale[] = []
        for (const tr of itemTranslationRows) {
          if (tr.menuItemId !== item.id) continue
          const loc = tr.locale as Locale
          if (!routing.locales.includes(loc)) continue
          itemPerLocale[loc] = { name: tr.name, tag: tr.tag }
          if (tr.aiGenerated && !tr.reviewedAt) {
            itemAiLocales.push(loc)
            for (const field of ["name", "tag"] as const) {
              if (tr[field] !== null && tr[field] !== undefined) {
                itemNeedsReview.push(`${field}.${loc}`)
              }
            }
          }
        }
        return {
          id: item.id,
          amountCents: item.amountCents,
          sortOrder: item.sortOrder,
          translations: itemPerLocale,
          needsReview: itemNeedsReview,
          aiGeneratedLocales: itemAiLocales,
        }
      })
    return {
      id: cat.id,
      sortOrder: cat.sortOrder,
      translations: perLocale,
      needsReview: catNeedsReview,
      aiGeneratedLocales: catAiLocales,
      items,
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <PricelistsTabs
        labels={{
          food: t("tabs.food"),
          games: t("tabs.games"),
          birthdays: t("tabs.birthdays"),
        }}
        food={
          <BranchMenuForm
            branchId={row.id}
            slug={row.slug}
            initialCategories={menuInitial}
          />
        }
        games={
          <BranchPricesForm
            branchId={row.id}
            slug={row.slug}
            initialRows={priceInitial}
          />
        }
        birthdays={
          <BranchPackagesForm
            branchId={row.id}
            slug={row.slug}
            initialRows={packageInitial}
          />
        }
      />
    </div>
  )
}
