import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { asc, eq, inArray } from "drizzle-orm"

import { routing, type Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import {
  menuCategory,
  menuCategoryTranslation,
  menuItem,
  menuItemTranslation,
} from "@/lib/db/schema/content"
import {
  BranchMenuForm,
  type MenuCategoryFormRow,
  type MenuItemFormRow,
} from "@/components/admin/branch-menu-form"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch menu",
  robots: { index: false, follow: false },
}

export default async function BranchMenuPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()
  const { row } = loaded

  const categoryRows = await db
    .select()
    .from(menuCategory)
    .where(eq(menuCategory.branchId, row.id))
    .orderBy(asc(menuCategory.sortOrder))
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
  const menuInitial: MenuCategoryFormRow[] = categoryRows.map((cat) => {
    const perLocale = {} as MenuCategoryFormRow["translations"]
    for (const loc of routing.locales) {
      perLocale[loc] = { title: null }
    }
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
        for (const loc of routing.locales) {
          itemPerLocale[loc] = { name: null, tag: null }
        }
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
    <BranchMenuForm
      branchId={row.id}
      slug={row.slug}
      initialCategories={menuInitial}
    />
  )
}
