import "server-only"

import { asc } from "drizzle-orm"

import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"

// Editor-side reads: full views with every child ordered by sortOrder. The
// public site uses its own (capped/filtered) reads. All take a locationId, not
// a slug — pages resolve the slug via requireLocationAccess first.

export async function getGeneralEditor(locationId: string) {
  return db.query.location.findFirst({
    where: (fields, { eq }) => eq(fields.id, locationId),
    with: { site: true },
  })
}

export async function getHomeEditor(locationId: string) {
  return db.query.location.findFirst({
    where: (fields, { eq }) => eq(fields.id, locationId),
    with: {
      home: true,
      site: true,
      features: { orderBy: (f) => [asc(f.sortOrder)] },
      services: { orderBy: (f) => [asc(f.sortOrder)] },
      reviews: { orderBy: (f) => [asc(f.sortOrder)] },
      galleryImages: { orderBy: (f) => [asc(f.sortOrder)] },
      contactSubjects: { orderBy: (f) => [asc(f.sortOrder)] },
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

export async function getLeads(locationId: string) {
  return db.query.lead.findMany({
    where: (fields, { eq }) => eq(fields.locationId, locationId),
    orderBy: (fields, { desc }) => [desc(fields.createdAt)],
  })
}

export async function listAllLocations() {
  return db.query.location.findMany({ orderBy: [asc(location.sortOrder)] })
}

export async function listTeam() {
  return db.query.user.findMany({
    with: { memberships: { with: { location: true } } },
    orderBy: (fields, { asc: ascending }) => [ascending(fields.name)],
  })
}
