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
  offeringPackage,
  offeringPackageTranslation,
} from "@/lib/db/schema/content"
import { mediaAsset } from "@/lib/db/schema/media"
import * as services from "@/lib/services"
import {
  BranchForm,
  type BranchFormInitial,
} from "@/components/admin/branch-form"
import { BranchHoursForm } from "@/components/admin/branch-hours-form"
import {
  BranchPackagesForm,
  type PackageFormRow,
} from "@/components/admin/branch-packages-form"

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
    </div>
  )
}
