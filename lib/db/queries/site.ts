import "server-only"

import { asc, desc, eq } from "drizzle-orm"
import { cache } from "react"

import {
  BRANCHES,
  branchIds,
  isBranchId,
  mergeBranch,
  type Branch,
  type BranchId,
} from "@/lib/branches"
import { db } from "@/lib/db"
import { legalPage, location } from "@/lib/db/schema"
import type { LegalPageKind } from "@/lib/legal"

export function logError<T>(query: string, fallback: T) {
  return (error: unknown): T => {
    console.error(`[site] ${query} failed; showing built-in content`, error)
    return fallback
  }
}

export const getSiteBranches = cache(
  async (): Promise<Record<BranchId, Branch>> => {
    const rows = await db.query.location
      .findMany({ orderBy: [asc(location.sortOrder)] })
      .catch(logError("getSiteBranches", []))
    const bySlug = new Map(rows.map((row) => [row.slug, row]))
    const ordered = [
      ...new Set([...rows.map((row) => row.slug), ...branchIds]),
    ].filter(isBranchId)
    return Object.fromEntries(
      ordered.map((id) => [id, mergeBranch(BRANCHES[id], bySlug.get(id))])
    ) as Record<BranchId, Branch>
  }
)

const MAX_HOME_REVIEWS = 9

export async function getHomeContent() {
  return db.query.location.findMany({
    orderBy: [asc(location.sortOrder)],
    with: {
      home: true,
      pricing: true,
      site: true,
      features: { orderBy: (f) => [asc(f.sortOrder)] },
      services: { orderBy: (f) => [asc(f.sortOrder)] },
      googleReviews: {
        where: (r, { eq }) => eq(r.isPublished, true),
        orderBy: (r) => [asc(r.sortOrder), desc(r.publishedAt)],
        limit: MAX_HOME_REVIEWS,
      },
      galleryImages: { orderBy: (f) => [asc(f.sortOrder)] },
      contactSubjects: { orderBy: (f) => [asc(f.sortOrder)] },
    },
  })
}

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

export const getEvents = cache(async () =>
  db.query.location.findMany({
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
)

export async function getLegalPages(kind: LegalPageKind) {
  return db
    .select({
      slug: location.slug,
      body: legalPage.body,
      updatedAt: legalPage.updatedAt,
    })
    .from(legalPage)
    .innerJoin(location, eq(legalPage.locationId, location.id))
    .where(eq(legalPage.kind, kind))
}

export type SiteHomeContent = Awaited<ReturnType<typeof getHomeContent>>[number]
export type SiteMenu = Awaited<ReturnType<typeof getMenus>>[number]
export type SiteEventLocation = Awaited<ReturnType<typeof getEvents>>[number]
export type SiteEventType = SiteEventLocation["eventTypes"][number]
export type SiteLegalPage = Awaited<ReturnType<typeof getLegalPages>>[number]
