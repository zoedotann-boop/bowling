import { beforeEach, describe, expect, test } from "bun:test"
import { asc, eq } from "drizzle-orm"

import { menuCategory, menuItem } from "@/lib/db/schema"
import {
  access,
  addLocation,
  db,
  resetLocations,
  text,
} from "@/lib/db/testing/admin-actions"

import type { MenuDraft } from "./schemas"

const { saveMenu } = await import("./menu")

const item = (name: string, amount: number | null = null) => ({
  name: text(name),
  description: text(""),
  amount,
  isVisible: true,
})

function save(categories: MenuDraft["categories"]) {
  return saveMenu({
    slug: access.location.slug,
    heading: text("תפריט"),
    intro: text(""),
    categories,
  })
}

function load(locationId = access.location.id) {
  return db.query.menuCategory.findMany({
    where: eq(menuCategory.locationId, locationId),
    orderBy: [asc(menuCategory.sortOrder)],
    with: { items: { orderBy: [asc(menuItem.sortOrder)] } },
  })
}

beforeEach(async () => {
  await resetLocations()
})

describe("saveMenu", () => {
  test("creates categories with their items in order", async () => {
    const result = await save([
      {
        label: text("פיצות"),
        isVisible: true,
        items: [item("מרגריטה", 49), item("זיתים", 55)],
      },
      { label: text("שתייה"), isVisible: false, items: [item("קולה", 12)] },
    ])

    expect(result).toEqual({ ok: true })
    const categories = await load()
    expect(categories.map((c) => c.label.he)).toEqual(["פיצות", "שתייה"])
    expect(categories[0].items.map((i) => [i.name.he, i.amount])).toEqual([
      ["מרגריטה", 49],
      ["זיתים", 55],
    ])
  })

  test("moves, edits and deletes items on a later save", async () => {
    await save([
      {
        label: text("פיצות"),
        isVisible: true,
        items: [item("א"), item("ב"), item("ג")],
      },
    ])
    const [category] = await load()
    const [a, , c] = category.items

    await save([
      {
        id: category.id,
        label: text("פיצות"),
        isVisible: true,
        items: [
          { ...item("ג"), id: c.id },
          { ...item("א חדש"), id: a.id },
        ],
      },
    ])

    const [updated] = await load()
    expect(updated.items.map((i) => [i.id, i.name.he])).toEqual([
      [c.id, "ג"],
      [a.id, "א חדש"],
    ])
  })

  test("ignores category ids that belong to another location", async () => {
    const other = await addLocation("ramat-gan")
    const [foreign] = await db
      .insert(menuCategory)
      .values({ locationId: other.id, label: text("זר") })
      .returning()

    await save([
      { id: foreign.id, label: text("נחטף"), isVisible: true, items: [] },
    ])

    const [untouched] = await load(other.id)
    expect(untouched.label).toEqual(text("זר"))
    expect((await load()).map((c) => c.label.he)).toEqual(["נחטף"])
  })
})
