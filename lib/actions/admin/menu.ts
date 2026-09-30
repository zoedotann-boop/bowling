"use server"

import { eq, inArray } from "drizzle-orm"
import { refresh } from "next/cache"

import { requireLocationAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import { menuCategory, menuContent, menuItem } from "@/lib/db/schema"

import { menuSchema } from "./schemas"
import { type ActionResult, OK, readSlug } from "./shared"
import { ownedIds, syncRows, upsert, withIds } from "./sync"

export async function saveMenu(input: unknown): Promise<ActionResult> {
  const { location: loc } = await requireLocationAccess(
    readSlug(input),
    "content"
  )
  const locationId = loc.id

  const parsed = menuSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const data = parsed.data

  await db.transaction(async (tx) => {
    await upsert(tx, menuContent, menuContent.locationId, [
      { locationId, heading: data.heading, intro: data.intro },
    ])

    const scope = eq(menuCategory.locationId, locationId)
    const categories = withIds(
      data.categories,
      await ownedIds(tx, menuCategory, scope)
    )
    await syncRows(
      tx,
      menuCategory,
      scope,
      categories.map(({ id, label, isVisible, sortOrder }) => ({
        id,
        locationId,
        label,
        isVisible,
        sortOrder,
      }))
    )
    await syncRows(
      tx,
      menuItem,
      inArray(
        menuItem.categoryId,
        categories.map((category) => category.id)
      ),
      categories.flatMap((category) =>
        withIds(category.items).map((item) => ({
          ...item,
          categoryId: category.id,
        }))
      )
    )
  })

  refresh()
  return OK
}
