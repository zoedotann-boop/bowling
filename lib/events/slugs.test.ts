import { describe, expect, test } from "bun:test"

import { existsSync } from "node:fs"

import { eventPageClosing, isBirthdayEvent, waiverPath } from "./slugs"

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

describe("eventPageClosing", () => {
  test("shows the booking form at the bottom of the event page by default", () => {
    expect(
      eventPageClosing({
        slug: "birthdays",
        hasBookingForm: true,
        showFormOnPage: true,
      })
    ).toBe("booking")
  })

  test("shows the contact section instead when the form is link-only", () => {
    expect(
      eventPageClosing({
        slug: "birthdays",
        hasBookingForm: true,
        showFormOnPage: false,
      })
    ).toBe("contact")
  })

  test("always shows the contact section for contact-form events", () => {
    expect(
      eventPageClosing({
        slug: "corporate",
        hasBookingForm: false,
        showFormOnPage: true,
      })
    ).toBe("contact")
  })

  test("shows nothing when the event has no booking form", () => {
    expect(
      eventPageClosing({
        slug: "brand-new-event",
        hasBookingForm: false,
        showFormOnPage: false,
      })
    ).toBeNull()
  })
})
