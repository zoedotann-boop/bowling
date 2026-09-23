"use server"

import { eq } from "drizzle-orm"

import { requireLocationAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import {
  contactSubject,
  galleryImage,
  homeContent,
  homeFeature,
  homeReview,
  homeService,
  siteContent,
} from "@/lib/db/schema"

import { homeSchema } from "./schemas"
import { type ActionResult, OK, syncCollection } from "./shared"

// Saves the home page: singleton content rows (upserted) plus five reorderable
// collections synced via syncCollection. sortOrder is injected from array index.
export async function saveHome(input: unknown): Promise<ActionResult> {
  const parsed = homeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const data = parsed.data

  const { location: loc } = await requireLocationAccess(data.slug, "content")
  const locationId = loc.id

  const homeValues = {
    heroTitle: data.heroTitle,
    heroSubtitle: data.heroSubtitle,
    heroCtaLabel: data.heroCtaLabel,
    servicesTitle: data.servicesTitle,
    servicesIntro: data.servicesIntro,
    galleryTitle: data.galleryTitle,
    reviewsTitle: data.reviewsTitle,
    aboutImageUrl: data.aboutImageUrl || null,
  }
  await db
    .insert(homeContent)
    .values({ locationId, ...homeValues })
    .onConflictDoUpdate({ target: homeContent.locationId, set: homeValues })

  const siteValues = {
    contactTitle: data.contactTitle,
    contactIntro: data.contactIntro,
  }
  await db
    .insert(siteContent)
    .values({ locationId, ...siteValues })
    .onConflictDoUpdate({ target: siteContent.locationId, set: siteValues })

  const features = await db.query.homeFeature.findMany({
    where: eq(homeFeature.locationId, locationId),
    columns: { id: true },
  })
  await syncCollection({
    existingIds: features.map((row) => row.id),
    incoming: data.features.map((row, sortOrder) => ({ ...row, sortOrder })),
    insert: async (row) => {
      await db.insert(homeFeature).values({
        locationId,
        icon: row.icon,
        label: row.label,
        description: row.description,
        sortOrder: row.sortOrder,
      })
    },
    update: async (id, row) => {
      await db
        .update(homeFeature)
        .set({
          icon: row.icon,
          label: row.label,
          description: row.description,
          sortOrder: row.sortOrder,
        })
        .where(eq(homeFeature.id, id))
    },
    remove: async (id) => {
      await db.delete(homeFeature).where(eq(homeFeature.id, id))
    },
  })

  const services = await db.query.homeService.findMany({
    where: eq(homeService.locationId, locationId),
    columns: { id: true },
  })
  await syncCollection({
    existingIds: services.map((row) => row.id),
    incoming: data.services.map((row, sortOrder) => ({ ...row, sortOrder })),
    insert: async (row) => {
      await db.insert(homeService).values({
        locationId,
        title: row.title,
        description: row.description,
        imageUrl: row.imageUrl || null,
        sortOrder: row.sortOrder,
      })
    },
    update: async (id, row) => {
      await db
        .update(homeService)
        .set({
          title: row.title,
          description: row.description,
          imageUrl: row.imageUrl || null,
          sortOrder: row.sortOrder,
        })
        .where(eq(homeService.id, id))
    },
    remove: async (id) => {
      await db.delete(homeService).where(eq(homeService.id, id))
    },
  })

  const reviews = await db.query.homeReview.findMany({
    where: eq(homeReview.locationId, locationId),
    columns: { id: true },
  })
  await syncCollection({
    existingIds: reviews.map((row) => row.id),
    incoming: data.reviews.map((row, sortOrder) => ({ ...row, sortOrder })),
    insert: async (row) => {
      await db.insert(homeReview).values({
        locationId,
        author: row.author,
        quote: row.quote,
        rating: row.rating,
        sortOrder: row.sortOrder,
      })
    },
    update: async (id, row) => {
      await db
        .update(homeReview)
        .set({
          author: row.author,
          quote: row.quote,
          rating: row.rating,
          sortOrder: row.sortOrder,
        })
        .where(eq(homeReview.id, id))
    },
    remove: async (id) => {
      await db.delete(homeReview).where(eq(homeReview.id, id))
    },
  })

  const gallery = await db.query.galleryImage.findMany({
    where: eq(galleryImage.locationId, locationId),
    columns: { id: true },
  })
  await syncCollection({
    existingIds: gallery.map((row) => row.id),
    incoming: data.gallery.map((row, sortOrder) => ({ ...row, sortOrder })),
    insert: async (row) => {
      await db.insert(galleryImage).values({
        locationId,
        imageUrl: row.imageUrl,
        alt: row.alt,
        sortOrder: row.sortOrder,
      })
    },
    update: async (id, row) => {
      await db
        .update(galleryImage)
        .set({
          imageUrl: row.imageUrl,
          alt: row.alt,
          sortOrder: row.sortOrder,
        })
        .where(eq(galleryImage.id, id))
    },
    remove: async (id) => {
      await db.delete(galleryImage).where(eq(galleryImage.id, id))
    },
  })

  const subjects = await db.query.contactSubject.findMany({
    where: eq(contactSubject.locationId, locationId),
    columns: { id: true },
  })
  await syncCollection({
    existingIds: subjects.map((row) => row.id),
    incoming: data.contactSubjects.map((row, sortOrder) => ({
      ...row,
      sortOrder,
    })),
    insert: async (row) => {
      await db.insert(contactSubject).values({
        locationId,
        label: row.label,
        sortOrder: row.sortOrder,
      })
    },
    update: async (id, row) => {
      await db
        .update(contactSubject)
        .set({ label: row.label, sortOrder: row.sortOrder })
        .where(eq(contactSubject.id, id))
    },
    remove: async (id) => {
      await db.delete(contactSubject).where(eq(contactSubject.id, id))
    },
  })

  return OK
}
