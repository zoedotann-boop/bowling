import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { asc, eq, inArray } from "drizzle-orm"

import { routing, type Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import {
  eventOffering,
  eventOfferingTranslation,
} from "@/lib/db/schema/content"
import { mediaAsset } from "@/lib/db/schema/media"
import {
  BranchEventsForm,
  type EventFormRow,
} from "@/components/admin/branch/branch-events-form"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch events",
  robots: { index: false, follow: false },
}

export default async function BranchEventsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()
  const { row } = loaded

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

  return (
    <BranchEventsForm
      branchId={row.id}
      slug={row.slug}
      initialRows={eventInitial}
    />
  )
}
