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

const price = (amount: number | null, label = "", isVisible = true) => ({
  label: text(label),
  amount,
  isVisible,
})

const item = (name: string, amount?: number) => ({
  name: text(name),
  description: text(""),
  prices: amount === undefined ? [] : [price(amount)],
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
    expect(
      categories[0].items.map((i) => [i.name.he, i.prices[0].amount])
    ).toEqual([
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

  test("saves several named prices per item, including hidden ones", async () => {
    const prices = [
      price(19, "צ׳ייסר"),
      price(29, "שוט"),
      price(200, "בקבוק", false),
    ]
    await save([
      {
        label: text("אלכוהול"),
        isVisible: true,
        items: [{ ...item("ערק"), prices }],
      },
    ])

    const [category] = await load()
    expect(category.items[0].prices).toEqual(prices)

    await save([
      {
        id: category.id,
        label: text("אלכוהול"),
        isVisible: true,
        items: [{ ...item("ערק"), id: category.items[0].id, prices: [] }],
      },
    ])
    const [updated] = await load()
    expect(updated.items[0].prices).toEqual([])
  })

  test("rejects prices that are not whole, non-negative shekels", async () => {
    for (const amount of [-5, 12.5]) {
      const result = await save([
        {
          label: text("שתייה"),
          isVisible: true,
          items: [{ ...item("קולה"), prices: [price(amount)] }],
        },
      ])
      expect(result).toEqual({ ok: false, error: "invalid" })
    }
    expect(await load()).toEqual([])
  })
})
