import { describe, expect, test } from "bun:test"

import type { BookingFormField } from "@/lib/events/fields"

import { parseWholeNumber, toFormFieldDraft, toHoursDraft } from "./drafts"

const DEFAULT_FIELD: BookingFormField = {
  key: "firstName",
  type: "text",
  label: { he: "שם פרטי", en: "First name" },
  placeholder: null,
  options: null,
  minValue: null,
  maxValue: null,
  isRequired: true,
}

describe("toFormFieldDraft", () => {
  test("turns an unsaved default field into a new visible row", () => {
    expect(toFormFieldDraft(DEFAULT_FIELD)).toEqual({
      id: undefined,
      key: "firstName",
      type: "text",
      label: { he: "שם פרטי", en: "First name" },
      placeholder: { he: "", en: "" },
      options: [],
      minValue: null,
      maxValue: null,
      isRequired: true,
      isVisible: true,
    })
  })

  test("keeps a saved field's id, visibility and select options", () => {
    const draft = toFormFieldDraft({
      ...DEFAULT_FIELD,
      id: "7b1f0d4e-2d6c-4c55-9a53-0c8f0a1b2c3d",
      type: "select",
      options: [{ value: "a", label: { he: "א" } }],
      isVisible: false,
    })
    expect(draft.id).toBe("7b1f0d4e-2d6c-4c55-9a53-0c8f0a1b2c3d")
    expect(draft.isVisible).toBe(false)
    expect(draft.options).toEqual([{ value: "a", label: { he: "א", en: "" } }])
  })
})

describe("toHoursDraft", () => {
  test("fills missing days with the default 10:00–03:00 hours", () => {
    const draft = toHoursDraft([{ day: 6, closed: true }])
    expect(draft).toHaveLength(7)
    expect(draft[0]).toEqual({
      day: 0,
      closed: false,
      open: "10:00",
      close: "03:00",
    })
    expect(draft[6]).toEqual({ day: 6, closed: true })
  })
})

describe("parseWholeNumber", () => {
  test("rounds to a whole number and clears on blank input", () => {
    expect(parseWholeNumber("12.5")).toBe(13)
    expect(parseWholeNumber("40")).toBe(40)
    expect(parseWholeNumber(" ")).toBeNull()
    expect(parseWholeNumber("abc")).toBeNull()
  })
})
