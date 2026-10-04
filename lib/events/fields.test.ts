import { describe, expect, test } from "bun:test"

import { isCoreField, newFieldKey, toTimeOptions } from "./fields"

describe("newFieldKey", () => {
  test("produces a key the save schema accepts", () => {
    expect(newFieldKey()).toMatch(/^[a-zA-Z][a-zA-Z0-9_]*$/)
  })

  test("never repeats, so new fields cannot collide", () => {
    const keys = new Set(Array.from({ length: 200 }, newFieldKey))
    expect(keys.size).toBe(200)
  })
})

describe("isCoreField", () => {
  test("protects the fields the booking email depends on", () => {
    expect(isCoreField("firstName")).toBe(true)
    expect(isCoreField("lastName")).toBe(true)
    expect(isCoreField("email")).toBe(true)
  })

  test("leaves every other field removable", () => {
    expect(isCoreField("phone")).toBe(false)
    expect(isCoreField(newFieldKey())).toBe(false)
  })
})

describe("toTimeOptions", () => {
  test("turns times into options labelled with the time itself", () => {
    expect(toTimeOptions(["16:00"])).toEqual([
      { value: "16:00", label: { he: "16:00", en: "16:00" } },
    ])
  })

  test("orders through the evening, keeping after-midnight times last", () => {
    const values = toTimeOptions(["00:30", "18:00", "10:00", "23:30"]).map(
      (option) => option.value
    )
    expect(values).toEqual(["10:00", "18:00", "23:30", "00:30"])
  })

  test("drops blank, malformed and repeated times", () => {
    const values = toTimeOptions(["", " 12:00 ", "12:00", "25:00", "9:00"]).map(
      (option) => option.value
    )
    expect(values).toEqual(["12:00"])
  })

  test("is empty when no times were given", () => {
    expect(toTimeOptions([])).toEqual([])
  })
})
