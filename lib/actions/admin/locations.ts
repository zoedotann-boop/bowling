"use server"

import { eq } from "drizzle-orm"
import { refresh } from "next/cache"

import { requireOwnerAccess } from "@/lib/admin/access"
import { isBranchId } from "@/lib/branches"
import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"

import { locationsSchema } from "./schemas"
import { type ActionResult, OK } from "./shared"

export async function saveLocations(input: unknown): Promise<ActionResult> {
  await requireOwnerAccess()

  const parsed = locationsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const rows = parsed.data.locations

  const existing = await db.query.location.findMany({
    columns: { id: true, slug: true },
  })
  const slugById = new Map(existing.map((row) => [row.id, row.slug]))
  const slugs = rows.map((row) => (row.id && slugById.get(row.id)) || row.slug)
  if (new Set(slugs).size !== slugs.length) {
    return { ok: false, error: "slug-taken" }
  }
  if (!slugs.every(isBranchId)) return { ok: false, error: "unknown-branch" }

  await db.transaction(async (tx) => {
    const keptIds = new Set(rows.map((row) => row.id).filter(Boolean))
    for (const { id } of existing) {
      if (!keptIds.has(id)) await tx.delete(location).where(eq(location.id, id))
    }

    for (const [sortOrder, row] of rows.entries()) {
      const values = { name: row.name, isVisible: row.isVisible, sortOrder }
      if (row.id && slugById.has(row.id)) {
        await tx.update(location).set(values).where(eq(location.id, row.id))
      } else {
        await tx.insert(location).values({
          ...values,
          slug: row.slug,
          addressLine1: { he: "" },
          addressFull: { he: "" },
        })
      }
    }
  })

  refresh()
  return OK
}
