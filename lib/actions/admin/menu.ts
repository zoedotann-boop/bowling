"use server"

import { eq } from "drizzle-orm"

import { requireLocationAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import { menuCategory, menuContent, menuItem } from "@/lib/db/schema"

import { menuSchema } from "./schemas"
import { type ActionResult, OK, syncCollection } from "./shared"

// Saves the two-level menu (category → item). Two-level parents can't use a
// top-level syncCollection: insert new categories first with `.returning({ id })`
// to map array index → id, delete removed categories by hand, then sync each
// category's items.
export async function saveMenu(input: unknown): Promise<ActionResult> {
  const parsed = menuSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const data = parsed.data

  const { location: loc } = await requireLocationAccess(data.slug, "content")
  const locationId = loc.id

  const contentValues = { heading: data.heading, intro: data.intro }
  await db
    .insert(menuContent)
    .values({ locationId, ...contentValues })
    .onConflictDoUpdate({ target: menuContent.locationId, set: contentValues })

  const existingCategories = await db.query.menuCategory.findMany({
    where: eq(menuCategory.locationId, locationId),
    columns: { id: true },
  })
  const keptIds = new Set(
    data.categories.map((category) => category.id).filter(Boolean)
  )
  for (const category of existingCategories) {
    if (!keptIds.has(category.id)) {
      await db.delete(menuCategory).where(eq(menuCategory.id, category.id))
    }
  }

  for (const [sortOrder, category] of data.categories.entries()) {
    let categoryId: string
    if (category.id) {
      await db
        .update(menuCategory)
        .set({
          label: category.label,
          isVisible: category.isVisible,
          sortOrder,
        })
        .where(eq(menuCategory.id, category.id))
      categoryId = category.id
    } else {
      const [inserted] = await db
        .insert(menuCategory)
        .values({
          locationId,
          label: category.label,
          isVisible: category.isVisible,
          sortOrder,
        })
        .returning({ id: menuCategory.id })
      categoryId = inserted.id
    }

    const existingItems = await db.query.menuItem.findMany({
      where: eq(menuItem.categoryId, categoryId),
      columns: { id: true },
    })
    await syncCollection({
      existingIds: existingItems.map((row) => row.id),
      incoming: category.items.map((row, itemOrder) => ({
        ...row,
        sortOrder: itemOrder,
      })),
      insert: async (row) => {
        await db.insert(menuItem).values({
          categoryId,
          name: row.name,
          description: row.description,
          amount: row.amount,
          isVisible: row.isVisible,
          sortOrder: row.sortOrder,
        })
      },
      update: async (id, row) => {
        await db
          .update(menuItem)
          .set({
            name: row.name,
            description: row.description,
            amount: row.amount,
            isVisible: row.isVisible,
            sortOrder: row.sortOrder,
          })
          .where(eq(menuItem.id, id))
      },
      remove: async (id) => {
        await db.delete(menuItem).where(eq(menuItem.id, id))
      },
    })
  }

  return OK
}
