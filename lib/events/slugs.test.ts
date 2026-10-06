import { describe, expect, test } from "bun:test"

import { existsSync } from "node:fs"

import { isBirthdayEvent, waiverPath } from "./slugs"

describe("isBirthdayEvent", () => {
  test("covers every birthday-style event", () => {
    expect(["birthdays", "gymboree", "no-room"].every(isBirthdayEvent)).toBe(
      true
    )
  })

  test("rejects other events and non-string slugs", () => {
    expect(isBirthdayEvent("corporate")).toBe(false)
    expect(isBirthdayEvent("team")).toBe(false)
    expect(isBirthdayEvent(undefined)).toBe(false)
  })
})

describe("waiverPath", () => {
  test("builds the standalone waiver URL for a branch event", () => {
    expect(waiverPath("ramat-gan", "birthdays")).toBe(
      "/ramat-gan/events/birthdays/waiver"
    )
  })

  test("matches the waiver route on disk", () => {
    const route = waiverPath("[branch]", "[slug]")
    expect(existsSync(`app${route}/page.tsx`)).toBe(true)
  })
})
