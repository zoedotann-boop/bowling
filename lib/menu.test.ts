import { describe, expect, test } from "bun:test"

import { blankPricesLike, displayPrices, type MenuItemPrice } from "./menu"

const shot = { he: "שוט", en: "Shot" }
const bottle = { he: "בקבוק", en: "Bottle" }

describe("displayPrices", () => {
  test("formats each shown price with its label in the locale", () => {
    const prices: MenuItemPrice[] = [
      { label: shot, amount: 29, isVisible: true },
      { label: bottle, amount: 200, isVisible: true },
    ]
    expect(displayPrices(prices, "en")).toEqual([
      { label: "Shot", price: "29 ₪" },
      { label: "Bottle", price: "200 ₪" },
    ])
  })

  test("skips hidden prices and prices without an amount", () => {
    const prices: MenuItemPrice[] = [
      { label: shot, amount: 29, isVisible: false },
      { label: bottle, amount: null, isVisible: true },
      { label: { he: "" }, amount: 45, isVisible: true },
    ]
    expect(displayPrices(prices, "he")).toEqual([{ label: "", price: "45 ₪" }])
  })

  test("falls back to the Hebrew label when the English one is blank", () => {
    const prices = [
      { label: { he: "שוט", en: "" }, amount: 29, isVisible: true },
    ]
    expect(displayPrices(prices, "en")).toEqual([
      { label: "שוט", price: "29 ₪" },
    ])
  })

  test("returns nothing for an item without prices", () => {
    expect(displayPrices([], "he")).toEqual([])
  })
})

describe("blankPricesLike", () => {
  test("starts a new item with one unnamed, empty price", () => {
    expect(blankPricesLike()).toEqual([
      { label: { he: "", en: "" }, amount: null, isVisible: true },
    ])
    expect(blankPricesLike([])).toHaveLength(1)
  })

  test("copies the price names of the item before it, without amounts", () => {
    const previous: MenuItemPrice[] = [
      { label: shot, amount: 29, isVisible: false },
      { label: bottle, amount: 200, isVisible: true },
    ]
    expect(blankPricesLike(previous)).toEqual([
      { label: shot, amount: null, isVisible: true },
      { label: bottle, amount: null, isVisible: true },
    ])
  })
})
