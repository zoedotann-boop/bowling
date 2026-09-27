import "server-only"

import { asc } from "drizzle-orm"

import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"

// Public read layer. Returns all locations ordered for the branch switcher.
export async function getSiteLocations() {
  return db.query.location.findMany({ orderBy: [asc(location.sortOrder)] })
}

// Admin-editable home-page content for every branch, keyed by slug. The public
// home page switches branches on the client (see BranchProvider), so it needs
// each branch's content up front rather than a single server-rendered branch.
// Only the localized content columns are selected — never the id/timestamps.
export async function getHomeContentByBranch() {
  const rows = await db.query.location.findMany({
    columns: { slug: true },
    with: {
      pricing: {
        columns: { locationId: false, createdAt: false, updatedAt: false },
      },
    },
  })
  return Object.fromEntries(
    rows.map((row) => [row.slug, { pricing: row.pricing ?? null }])
  )
}

// Content for a single branch (the value the client selects by active branch).
export type BranchHomeContent = Awaited<
  ReturnType<typeof getHomeContentByBranch>
>[string]
