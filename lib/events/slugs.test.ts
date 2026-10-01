import { describe, expect, test } from "bun:test"

import { isBirthdayEvent } from "./slugs"

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
