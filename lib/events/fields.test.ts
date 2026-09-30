import { describe, expect, test } from "bun:test"

import { isCoreField, newFieldKey } from "./fields"

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
