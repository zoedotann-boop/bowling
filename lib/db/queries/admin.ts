import "server-only"

import { asc, desc } from "drizzle-orm"

import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"

export async function getGeneralEditor(locationId: string) {
  return db.query.location.findFirst({
    where: (fields, { eq }) => eq(fields.id, locationId),
    with: { site: true },
  })
}

export async function getLegalEditor(locationId: string) {
  return db.query.legalPage.findMany({
    where: (fields, { eq }) => eq(fields.locationId, locationId),
    columns: { kind: true, body: true },
  })
}

export async function getHomeEditor(locationId: string) {
  return db.query.location.findFirst({
    where: (fields, { eq }) => eq(fields.id, locationId),
    with: {
      home: true,
      pricing: true,
      site: true,
      features: { orderBy: (f) => [asc(f.sortOrder)] },
      services: { orderBy: (f) => [asc(f.sortOrder)] },
      galleryImages: { orderBy: (f) => [asc(f.sortOrder)] },
      contactSubjects: { orderBy: (f) => [asc(f.sortOrder)] },
    },
  })
}

export async function getReviewsEditor(locationId: string) {
  return db.query.location.findFirst({
    where: (fields, { eq }) => eq(fields.id, locationId),
    columns: { googlePlaceId: true, googleReviewsAutoSync: true },
    with: {
      googleReviews: {
        orderBy: (f) => [asc(f.sortOrder), desc(f.publishedAt)],
      },
    },
  })
}

export async function getMenuEditor(locationId: string) {
  return db.query.location.findFirst({
    where: (fields, { eq }) => eq(fields.id, locationId),
    with: {
      menu: true,
      menuCategories: {
        orderBy: (f) => [asc(f.sortOrder)],
        with: { items: { orderBy: (f) => [asc(f.sortOrder)] } },
      },
    },
  })
}

export async function getEventsEditor(locationId: string) {
  return db.query.location.findFirst({
    where: (fields, { eq }) => eq(fields.id, locationId),
    with: {
      eventTypes: {
        orderBy: (f) => [asc(f.sortOrder)],
        with: {
          content: true,
          steps: { orderBy: (f) => [asc(f.sortOrder)] },
          packageLines: { orderBy: (f) => [asc(f.sortOrder)] },
          upgrades: { orderBy: (f) => [asc(f.sortOrder)] },
          formFields: { orderBy: (f) => [asc(f.sortOrder)] },
        },
      },
    },
  })
}

export async function listAllLocations() {
  return db.query.location.findMany({ orderBy: [asc(location.sortOrder)] })
}

export async function listTeam() {
  return db.query.user.findMany({
    with: { memberships: { columns: { locationId: true } } },
    orderBy: (fields, { asc: ascending }) => [ascending(fields.name)],
  })
}
