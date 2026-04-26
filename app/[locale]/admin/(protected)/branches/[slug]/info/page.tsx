import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"

import { routing, type Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import { mediaAsset } from "@/lib/db/schema/media"
import { BranchDangerZone } from "@/components/admin/branch/branch-danger-zone"
import {
  BranchForm,
  type BranchFormInitial,
} from "@/components/admin/branch/branch-form"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch info",
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

export default async function BranchInfoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()
  const { row, translations: translationRows } = loaded

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

  const initial: BranchFormInitial = {
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

  return (
    <div className="flex flex-col gap-8">
      <BranchForm mode="edit" initial={initial} />
      <BranchDangerZone branchId={row.id} />
    </div>
  )
}
