import { describe, expect, test } from "bun:test"

import type { SiteEventType } from "@/lib/db/queries/site"
import type { BookingFormField } from "@/lib/events/fields"
import en from "@/messages/en.json"
import he from "@/messages/he.json"

import { waiverEventTitle } from "./waiver"

const PHONE: BookingFormField = {
  key: "phone",
  type: "tel",
  label: { he: "טלפון", en: "Phone" },
  placeholder: null,
  options: null,
  minValue: null,
  maxValue: null,
  isRequired: true,
}

function eventType(
  slug: string,
  overrides: {
    formFields?: BookingFormField[]
    content?: Record<string, unknown> | null
  } = {}
): SiteEventType {
  return {
    slug,
    name: { he: "אירוע מותאם", en: "Custom event" },
    formFields: overrides.formFields ?? [],
    content:
      overrides.content === null
        ? null
        : {
            heroTitle: null,
            ...overrides.content,
          },
  } as unknown as SiteEventType
}

const base = {
  branchId: "ramat-gan" as const,
  locale: "he" as const,
  branchEvents: ["birthdays", "team", "corporate"],
}

describe("waiverEventTitle", () => {
  test("uses the message title when the DB has no event types", () => {
    expect(
      waiverEventTitle({ ...base, slug: "birthdays", eventTypes: [] })
    ).toBe(he.eventDetails.items.birthdays.title)
  })

  test("returns null for events that use the contact form", () => {
    expect(
      waiverEventTitle({ ...base, slug: "team", eventTypes: [] })
    ).toBeNull()
    expect(
      waiverEventTitle({
        ...base,
        slug: "corporate",
        eventTypes: [eventType("corporate", { formFields: [PHONE] })],
      })
    ).toBeNull()
  })

  test("returns null for events the branch does not offer", () => {
    expect(
      waiverEventTitle({ ...base, slug: "gymboree", eventTypes: [] })
    ).toBeNull()
    expect(
      waiverEventTitle({
        ...base,
        slug: "birthdays",
        eventTypes: [eventType("no-room")],
      })
    ).toBeNull()
    expect(
      waiverEventTitle({ ...base, slug: "unknown", eventTypes: [] })
    ).toBeNull()
  })

  test("returns null for a custom event without form fields", () => {
    expect(
      waiverEventTitle({
        ...base,
        slug: "bar-mitzvah",
        eventTypes: [eventType("bar-mitzvah")],
      })
    ).toBeNull()
  })

  test("prefers the admin-saved title in the active locale", () => {
    const eventTypes = [
      eventType("birthdays", {
        content: { heroTitle: { he: "מסיבת יום הולדת", en: "Birthday bash" } },
      }),
    ]
    expect(waiverEventTitle({ ...base, slug: "birthdays", eventTypes })).toBe(
      "מסיבת יום הולדת"
    )
    expect(
      waiverEventTitle({ ...base, locale: "en", slug: "birthdays", eventTypes })
    ).toBe("Birthday bash")
  })

  test("falls back to the message title, then to the event type name", () => {
    expect(
      waiverEventTitle({
        ...base,
        locale: "en",
        slug: "birthdays",
        eventTypes: [eventType("birthdays", { content: null })],
      })
    ).toBe(en.eventDetails.items.birthdays.title)
    expect(
      waiverEventTitle({
        ...base,
        slug: "bar-mitzvah",
        eventTypes: [eventType("bar-mitzvah", { formFields: [PHONE] })],
      })
    ).toBe("אירוע מותאם")
  })

  test("uses the branch-specific message title", () => {
    expect(
      waiverEventTitle({
        ...base,
        branchId: "rishon",
        slug: "birthdays",
        eventTypes: [],
        branchEvents: ["birthdays"],
      })
    ).toBe(he.eventDetails.branch.rishon.birthdays.title)
  })
})
