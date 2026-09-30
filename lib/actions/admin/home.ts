"use server"

import { eq } from "drizzle-orm"
import { refresh } from "next/cache"

import { requireLocationAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import {
  contactSubject,
  galleryImage,
  homeContent,
  homeFeature,
  homeService,
  pricingContent,
  siteContent,
} from "@/lib/db/schema"

import { homeSchema } from "./schemas"
import { type ActionResult, OK, readSlug } from "./shared"
import { syncRows, upsert, withIds } from "./sync"

export async function saveHome(input: unknown): Promise<ActionResult> {
  const { location: loc } = await requireLocationAccess(
    readSlug(input),
    "content"
  )
  const locationId = loc.id

  const parsed = homeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const data = parsed.data

  const homeValues = {
    heroTitle: data.heroTitle,
    heroSubtitle: data.heroSubtitle,
    heroCtaLabel: data.heroCtaLabel,
    servicesTitle: data.servicesTitle,
    servicesIntro: data.servicesIntro,
    galleryTitle: data.galleryTitle,
    reviewsTitle: data.reviewsTitle,
  }

  await db.transaction(async (tx) => {
    await upsert(tx, homeContent, homeContent.locationId, [
      { locationId, ...homeValues },
    ])
    await upsert(tx, siteContent, siteContent.locationId, [
      {
        locationId,
        contactTitle: data.contactTitle,
        contactIntro: data.contactIntro,
      },
    ])
    await upsert(tx, pricingContent, pricingContent.locationId, [
      { locationId, ...data.pricing },
    ])

    await syncRows(
      tx,
      homeFeature,
      eq(homeFeature.locationId, locationId),
      withIds(data.features).map((row) => ({ ...row, locationId }))
    )
    await syncRows(
      tx,
      homeService,
      eq(homeService.locationId, locationId),
      withIds(data.services).map((row) => ({
        ...row,
        locationId,
        imageUrl: row.imageUrl || null,
      }))
    )
    await syncRows(
      tx,
      galleryImage,
      eq(galleryImage.locationId, locationId),
      withIds(data.gallery).map((row) => ({ ...row, locationId }))
    )
    await syncRows(
      tx,
      contactSubject,
      eq(contactSubject.locationId, locationId),
      withIds(data.contactSubjects).map((row) => ({ ...row, locationId }))
    )
  })

  refresh()
  return OK
}
