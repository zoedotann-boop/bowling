import { describe, expect, test } from "bun:test"

import type { BookingFormField } from "@/lib/events/fields"

import { toFormFieldDraft } from "./drafts"

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
