import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { getTranslations } from "next-intl/server"

import { routing, type Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import { mediaAsset } from "@/lib/db/schema/media"
import * as services from "@/lib/services"
import { PageHeader } from "@/components/admin/shared/page-header"
import {
  BranchForm,
  type BranchFormInitial,
} from "@/components/admin/branch/branch-form"
import { BranchDangerZone } from "@/components/admin/branch/branch-danger-zone"
import { BranchHoursForm } from "@/components/admin/branch/branch-hours-form"
import {
  BranchDomainsForm,
  type BranchDomainRow,
} from "@/components/admin/branch/branch-domains-form"
import {
  LegalPagesManager,
  type LegalPageRow,
} from "@/components/admin/legal-pages-manager"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · General settings",
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

export default async function GeneralSettingsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()
  const { row, translations: translationRows } = loaded

  const t = await getTranslations({ locale, namespace: "Admin.general" })
  const tDomains = await getTranslations({ locale, namespace: "Admin.domains" })
  const tLegal = await getTranslations({ locale, namespace: "Admin.legal" })

  // Branch form initial
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
  for (const loc of routing.locales) {
    translations[loc] = {
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

  const branchInitial: BranchFormInitial = {
    id: row.id,
    slug: row.slug,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    mapUrl: row.mapUrl,
    latitude: row.latitude,
    longitude: row.longitude,
    heroImageId: row.heroImageId,
    heroImage,
    googlePlaceId: row.googlePlaceId,
    published: row.published,
    sortOrder: row.sortOrder,
    translations,
    needsReview,
    aiGeneratedLocales,
  }

  // Hours
  const hoursInitial = await services.hours.listByBranch(slug)

  // Domains
  const domains = await services.domains.listForBranch(row.id)
  const domainRows: BranchDomainRow[] = domains.map((d) => ({
    id: d.id,
    host: d.host,
  }))

  // Legal
  const legalPages = await services.legal.listByBranch(row.id)
  const legalRows: LegalPageRow[] = legalPages.map((page) => {
    const titles = {} as Record<Locale, string | null>
    const bodies = {} as Record<Locale, string | null>
    for (const loc of routing.locales) {
      titles[loc] = null
      bodies[loc] = null
    }
    titles.he = page.titleHe
    titles.en = page.titleEn
    titles.ru = page.titleRu
    titles.ar = page.titleAr
    bodies.he = page.bodyMarkdownHe
    bodies.en = page.bodyMarkdownEn
    bodies.ru = page.bodyMarkdownRu
    bodies.ar = page.bodyMarkdownAr
    return {
      slug: page.slug,
      titles,
      bodies,
      published: page.published,
      sortOrder: page.sortOrder,
    }
  })

  return (
    <div className="flex flex-col gap-12">
      <PageHeader title={t("title")} description={t("description")} />

      <Section title={t("sections.business")}>
        <BranchForm mode="edit" initial={branchInitial} />
      </Section>

      <Section title={t("sections.hours")}>
        <BranchHoursForm branchId={row.id} initialRows={hoursInitial} />
      </Section>

      <Section title={t("sections.popups")}>
        <PopupsPlaceholder />
      </Section>

      <Section title={tDomains("title")}>
        <BranchDomainsForm branchId={row.id} initial={domainRows} />
      </Section>

      <Section title={tLegal("title")}>
        <LegalPagesManager initial={legalRows} branchId={row.id} />
      </Section>

      <Section title={t("sections.danger")}>
        <BranchDangerZone branchId={row.id} />
      </Section>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-2 border-b-2 border-dashed border-ink/20 pb-2">
        <span aria-hidden className="size-1.5 rounded-full bg-red" />
        <h2 className="font-mono text-[11px] font-bold tracking-[0.22em] text-ink/70 uppercase">
          {title}
        </h2>
      </header>
      {children}
    </section>
  )
}

async function PopupsPlaceholder() {
  const t = await getTranslations("Admin.popups")
  return (
    <div className="rounded-lg border-2 border-dashed border-ink/30 bg-paper p-5 text-sm text-ink/70">
      <p className="font-semibold text-ink">{t("placeholderTitle")}</p>
      <p className="mt-1">{t("placeholderBody")}</p>
    </div>
  )
}
