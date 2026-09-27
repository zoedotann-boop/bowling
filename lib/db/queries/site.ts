import "server-only"

import { asc, desc } from "drizzle-orm"

import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"

// Public read layer. Mirrors the editor reads in queries/admin.ts, but returns
// every visible location at once (the branch switcher swaps content client-side
// without a reload, so the client needs all branches) and filters out anything
// hidden (invisible categories, menu items, event types, form fields).

// Returns all locations ordered for the branch switcher.
export async function getSiteLocations() {
  return db.query.location.findMany({ orderBy: [asc(location.sortOrder)] })
}

// Home page + shared chrome content (hero, features, services, gallery, reviews,
// contact, footer note, pricing) for every location, keyed by slug on the client.
export async function getHomeContent() {
  return db.query.location.findMany({
    orderBy: [asc(location.sortOrder)],
    with: {
      home: true,
      pricing: true,
      site: true,
      features: { orderBy: (f) => [asc(f.sortOrder)] },
      services: { orderBy: (f) => [asc(f.sortOrder)] },
      reviews: { orderBy: (f) => [asc(f.sortOrder)] },
      googleReviews: {
        where: (r, { eq }) => eq(r.isPublished, true),
        orderBy: (r) => [asc(r.sortOrder), desc(r.publishedAt)],
      },
      galleryImages: { orderBy: (f) => [asc(f.sortOrder)] },
      contactSubjects: { orderBy: (f) => [asc(f.sortOrder)] },
    },
  })
}

// Menu (heading/intro + visible categories and their visible items) per location.
export async function getMenus() {
  return db.query.location.findMany({
    orderBy: [asc(location.sortOrder)],
    with: {
      menu: true,
      menuCategories: {
        where: (c, { eq }) => eq(c.isVisible, true),
        orderBy: (f) => [asc(f.sortOrder)],
        with: {
          items: {
            where: (i, { eq }) => eq(i.isVisible, true),
            orderBy: (f) => [asc(f.sortOrder)],
          },
        },
      },
    },
  })
}

// Visible event types (with content, steps, package lines, upgrades and the
// dynamic booking-form fields) per location.
export async function getEvents() {
  return db.query.location.findMany({
    orderBy: [asc(location.sortOrder)],
    with: {
      eventTypes: {
        where: (e, { eq }) => eq(e.isVisible, true),
        orderBy: (f) => [asc(f.sortOrder)],
        with: {
          content: true,
          steps: { orderBy: (f) => [asc(f.sortOrder)] },
          packageLines: { orderBy: (f) => [asc(f.sortOrder)] },
          upgrades: { orderBy: (f) => [asc(f.sortOrder)] },
          formFields: {
            where: (f, { eq }) => eq(f.isVisible, true),
            orderBy: (f) => [asc(f.sortOrder)],
          },
        },
      },
    },
  })
}

// Row shapes exposed to the client providers/components.
export type SiteHomeContent = Awaited<ReturnType<typeof getHomeContent>>[number]
export type SiteMenu = Awaited<ReturnType<typeof getMenus>>[number]
export type SiteEventLocation = Awaited<ReturnType<typeof getEvents>>[number]
export type SiteEventType = SiteEventLocation["eventTypes"][number]
