import { describe, expect, test } from "bun:test"

import { imageUrlSchema } from "./schemas"

const valid = (value: string) => imageUrlSchema.safeParse(value).success

describe("imageUrlSchema", () => {
  test("accepts empty (use the default image)", () => {
    expect(valid("")).toBe(true)
  })

  test("accepts site paths and https URLs", () => {
    expect(valid("/events/birthdays-hero.png")).toBe(true)
    expect(
      valid("https://abc.public.blob.vercel-storage.com/admin/hero-x1.jpg")
    ).toBe(true)
    expect(valid("https://example.com/photo.jpg")).toBe(true)
  })

  test("rejects insecure, protocol-relative and script URLs", () => {
    expect(valid("http://example.com/photo.jpg")).toBe(false)
    expect(valid("//example.com/photo.jpg")).toBe(false)
    expect(valid("javascript:alert(1)")).toBe(false)
    expect(valid("photo.jpg")).toBe(false)
  })
})
