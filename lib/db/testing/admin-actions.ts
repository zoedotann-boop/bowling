import { mock } from "bun:test"

import { location } from "@/lib/db/schema"

import { testDb as db } from "./preload"

export { db }
export const access = { location: { id: "", slug: "" } }

mock.module("next/cache", () => ({ refresh: () => {} }))
mock.module("@/lib/admin/access", () => ({
  requireLocationAccess: async () => access,
  requireOwnerAccess: async () => undefined,
}))

export const text = (he: string) => ({ he, en: "" })

export async function addLocation(slug: string) {
  const [row] = await db
    .insert(location)
    .values({
      slug,
      name: text(slug),
      addressLine1: text(""),
      addressFull: text(""),
    })
    .returning({ id: location.id, slug: location.slug })
  return row
}

export async function resetLocations(slug = "rishon") {
  await db.delete(location)
  access.location = await addLocation(slug)
  return access.location
}
