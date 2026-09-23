"use server"

import { eq } from "drizzle-orm"

import { requireOwnerAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"

import { locationsSchema } from "./schemas"
import { type ActionResult, OK } from "./shared"

// Owner-only: create/rename/reorder/remove locations. The per-location General
// page fills in the rest of a location's details.
export async function saveLocations(input: unknown): Promise<ActionResult> {
  await requireOwnerAccess()

  const parsed = locationsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const rows = parsed.data.locations

  const slugs = rows.map((row) => row.slug)
  if (new Set(slugs).size !== slugs.length) {
    return { ok: false, error: "slug-taken" }
  }

  const existing = await db.query.location.findMany({ columns: { id: true } })
  const keptIds = new Set(rows.map((row) => row.id).filter(Boolean))
  for (const row of existing) {
    if (!keptIds.has(row.id)) {
      await db.delete(location).where(eq(location.id, row.id))
    }
  }

  for (const [sortOrder, row] of rows.entries()) {
    if (row.id) {
      await db
        .update(location)
        .set({
          slug: row.slug,
          name: row.name,
          isVisible: row.isVisible,
          sortOrder,
        })
        .where(eq(location.id, row.id))
    } else {
      await db.insert(location).values({
        slug: row.slug,
        name: row.name,
        isVisible: row.isVisible,
        sortOrder,
        // Required localized columns — the General page fills these in.
        addressLine1: { he: "" },
        addressFull: { he: "" },
      })
    }
  }

  return OK
}
