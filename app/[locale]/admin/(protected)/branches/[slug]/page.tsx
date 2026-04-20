import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { asc, eq, inArray } from "drizzle-orm"

import { Link } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import {
  branch,
  branchTranslation,
  eventOffering,
  eventOfferingTranslation,
  menuCategory,
  menuCategoryTranslation,
  menuItem,
  menuItemTranslation,
  offeringPackage,
  offeringPackageTranslation,
  priceRow,
  priceRowTranslation,
} from "@/lib/db/schema/content"
import { mediaAsset } from "@/lib/db/schema/media"
import * as services from "@/lib/services"
import {
  BranchForm,
  type BranchFormInitial,
} from "@/components/admin/branch-form"
import {
  BranchEventsForm,
  type EventFormRow,
} from "@/components/admin/branch-events-form"
import { BranchHoursForm } from "@/components/admin/branch-hours-form"
import {
  BranchMenuForm,
  type MenuCategoryFormRow,
  type MenuItemFormRow,
} from "@/components/admin/branch-menu-form"
import {
  BranchPackagesForm,
  type PackageFormRow,
} from "@/components/admin/branch-packages-form"
import {
  BranchPricesForm,
  type PriceRowForm,
  type PriceKind,
} from "@/components/admin/branch-prices-form"

export const metadata: Metadata = {
  title: "Admin · Edit branch",
  robots: { index: false, follow: false },
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

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: "Admin.branches.form" })
  const tl = await getTranslations({
    locale,
    namespace: "Admin.branches.list",
  })
  const tTabs = await getTranslations({
    locale,
    namespace: "Admin.branches.tabs",
  })

  const [row] = await db
    .select()
    .from(branch)
    .where(eq(branch.slug, slug))
    .limit(1)
  if (!row) notFound()

  const translationRows = await db
    .select()
    .from(branchTranslation)
    .where(eq(branchTranslation.branchId, row.id))

  const hoursInitial = await services.hours.listByBranch(slug)

  const packageRows = await db
    .select()
    .from(offeringPackage)
    .where(eq(offeringPackage.branchId, row.id))
    .orderBy(asc(offeringPackage.sortOrder))
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

  const eventRows = await db
    .select({
      row: eventOffering,
      imageBlobUrl: mediaAsset.blobUrl,
      imageFilename: mediaAsset.filename,
    })
    .from(eventOffering)
    .leftJoin(mediaAsset, eq(mediaAsset.id, eventOffering.imageId))
    .where(eq(eventOffering.branchId, row.id))
    .orderBy(asc(eventOffering.sortOrder))
  const eventTranslationRows = eventRows.length
    ? await db
        .select()
        .from(eventOfferingTranslation)
        .where(
          inArray(
            eventOfferingTranslation.eventOfferingId,
            eventRows.map((e) => e.row.id)
          )
        )
    : []
  const eventInitial: EventFormRow[] = eventRows.map(
    ({ row: ev, imageBlobUrl, imageFilename }) => {
      const perLocale = {} as EventFormRow["translations"]
      for (const loc of routing.locales) {
        perLocale[loc] = { title: null, description: null }
      }
      const rowNeedsReview: string[] = []
      const rowAiLocales: Locale[] = []
      for (const tr of eventTranslationRows) {
        if (tr.eventOfferingId !== ev.id) continue
        const loc = tr.locale as Locale
        if (!routing.locales.includes(loc)) continue
        perLocale[loc] = { title: tr.title, description: tr.description }
        if (tr.aiGenerated && !tr.reviewedAt) {
          rowAiLocales.push(loc)
          for (const field of ["title", "description"] as const) {
            if (tr[field] !== null && tr[field] !== undefined) {
              rowNeedsReview.push(`${field}.${loc}`)
            }
          }
        }
      }
      return {
        id: ev.id,
        image:
          ev.imageId && imageBlobUrl
            ? {
                id: ev.imageId,
                blobUrl: imageBlobUrl,
                filename: imageFilename ?? null,
              }
            : null,
        sortOrder: ev.sortOrder,
        translations: perLocale,
        needsReview: rowNeedsReview,
        aiGeneratedLocales: rowAiLocales,
      }
    }
  )

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

  let heroImage: BranchFormInitial["heroImage"] = null
  if (row.heroImageId) {
    const [asset] = await db
      .select({
        id: mediaAsset.id,
        blobUrl: mediaAsset.blobUrl,
        filename: mediaAsset.filename,
      })
      .from(mediaAsset)
      .where(eq(mediaAsset.id, row.heroImageId))
      .limit(1)
    if (asset) heroImage = asset
  }

  const translations: BranchFormInitial["translations"] =
    {} as BranchFormInitial["translations"]
  for (const locale of routing.locales) {
    translations[locale] = {
      displayName: null,
      shortName: null,
      address: null,
      city: null,
      heroHeadline: null,
      heroTagline: null,
      seoTitle: null,
      seoDescription: null,
    }
  }
  const needsReview: string[] = []
  const aiGeneratedLocales: Locale[] = []
  for (const tr of translationRows) {
    const loc = tr.locale as Locale
    if (!routing.locales.includes(loc)) continue
    translations[loc] = {
      displayName: tr.displayName,
      shortName: tr.shortName,
      address: tr.address,
      city: tr.city,
      heroHeadline: tr.heroHeadline,
      heroTagline: tr.heroTagline,
      seoTitle: tr.seoTitle,
      seoDescription: tr.seoDescription,
    }
    if (tr.aiGenerated && !tr.reviewedAt) {
      aiGeneratedLocales.push(loc)
      for (const field of TRANSLATION_FIELDS) {
        if (tr[field] !== null && tr[field] !== undefined) {
          needsReview.push(`${field}.${loc}`)
        }
      }
    }
  }

  const initial: BranchFormInitial = {
    id: row.id,
    slug: row.slug,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    mapUrl: row.mapUrl,
    latitude: row.latitude,
    longitude: row.longitude,
    brandAccent: row.brandAccent as "cherry" | "teal",
    heroImageId: row.heroImageId,
    heroImage,
    googlePlaceId: row.googlePlaceId,
    published: row.published,
    sortOrder: row.sortOrder,
    translations,
    needsReview,
    aiGeneratedLocales,
  }

  const displayName = translations[locale as Locale]?.displayName ?? row.slug

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link
          href="/admin/branches"
          className="text-xs text-ink-muted hover:text-ink"
        >
          ← {tl("title")}
        </Link>
        <h1 className="text-2xl font-semibold text-ink">
          {t("editTitle", { name: displayName })}
        </h1>
      </header>
      <BranchForm mode="edit" initial={initial} />
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="font-heading text-sm tracking-wide text-ink-muted uppercase">
          {tTabs("hours")}
        </h2>
        <BranchHoursForm branchId={row.id} initialRows={hoursInitial} />
      </section>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <BranchPackagesForm
          branchId={row.id}
          slug={row.slug}
          initialRows={packageInitial}
        />
      </section>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <BranchPricesForm
          branchId={row.id}
          slug={row.slug}
          initialRows={priceInitial}
        />
      </section>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <BranchEventsForm
          branchId={row.id}
          slug={row.slug}
          initialRows={eventInitial}
        />
      </section>
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <BranchMenuForm
          branchId={row.id}
          slug={row.slug}
          initialCategories={menuInitial}
        />
      </section>
    </div>
  )
}
