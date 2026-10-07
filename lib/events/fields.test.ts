import { describe, expect, test } from "bun:test"

import { clockTime, isCoreField, newFieldKey, TIME_OPTIONS } from "./fields"

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

describe("clockTime", () => {
  test("formats minutes since midnight as a two-digit clock time", () => {
    expect(clockTime(0)).toBe("00:00")
    expect(clockTime(9 * 60 + 5)).toBe("09:05")
    expect(clockTime(23 * 60 + 45)).toBe("23:45")
  })
})

describe("TIME_OPTIONS", () => {
  const values = TIME_OPTIONS.map((option) => option.value)

  test("covers 10:00 to 20:00 in quarter hours, in order", () => {
    expect(values).toHaveLength(41)
    expect(values.slice(0, 5)).toEqual([
      "10:00",
      "10:15",
      "10:30",
      "10:45",
      "11:00",
    ])
    expect(values.at(-1)).toBe("20:00")
    expect(values).toEqual([...values].sort())
  })

  test("leaves out times outside opening hours", () => {
    expect(values).not.toContain("00:00")
    expect(values).not.toContain("09:45")
    expect(values).not.toContain("20:15")
    expect(values).not.toContain("23:45")
  })

  test("includes every full, half and quarter hour once", () => {
    expect(new Set(values).size).toBe(values.length)
    expect(values).toContain("17:00")
    expect(values).toContain("17:15")
    expect(values).toContain("17:30")
    expect(values).toContain("17:45")
    expect(values).not.toContain("17:10")
  })

  test("labels each time with the time itself in both languages", () => {
    expect(TIME_OPTIONS.find((option) => option.value === "16:30")).toEqual({
      value: "16:30",
      label: { he: "16:30", en: "16:30" },
    })
  })
})
