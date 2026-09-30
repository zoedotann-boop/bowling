import { describe, expect, test } from "bun:test"

import { nextFreeSlug, toSlug } from "./slug"

describe("toSlug", () => {
  test("keeps lowercase English letters, digits and dashes", () => {
    expect(toSlug("ramat-gan-2")).toBe("ramat-gan-2")
  })

  test("lowercases and turns spaces and symbols into single dashes", () => {
    expect(toSlug("Summer  Camp!")).toBe("summer-camp-")
    expect(toSlug("Bar_Mitzvah")).toBe("bar-mitzvah")
  })

  test("drops characters that cannot appear in an address", () => {
    expect(toSlug("יום הולדת")).toBe("")
    expect(toSlug("  -kids")).toBe("kids")
  })
})

describe("nextFreeSlug", () => {
  test("starts numbering at 1", () => {
    expect(nextFreeSlug("event", ["birthdays"])).toBe("event-1")
  })

  test("skips numbers that are already used", () => {
    expect(nextFreeSlug("event", ["event-1", "event-2", "event-4"])).toBe(
      "event-3"
    )
  })
})
