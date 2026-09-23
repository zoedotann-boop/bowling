import "server-only"

import { asc } from "drizzle-orm"

import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"

// Public read layer. Returns all locations ordered for the branch switcher.
export async function getSiteLocations() {
  return db.query.location.findMany({ orderBy: [asc(location.sortOrder)] })
}
