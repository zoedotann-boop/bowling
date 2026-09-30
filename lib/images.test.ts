import { describe, expect, test } from "bun:test"

import { isOptimizableImage } from "./images"

describe("isOptimizableImage", () => {
  test("accepts site-relative paths", () => {
    expect(isOptimizableImage("/events/birthdays-hero.png")).toBe(true)
  })

  test("accepts uploads on the Vercel Blob store", () => {
    expect(
      isOptimizableImage(
        "https://abc123.public.blob.vercel-storage.com/admin/hero-x1y2.jpg"
      )
    ).toBe(true)
  })

  test("rejects other hosts, protocol-relative and insecure URLs", () => {
    expect(isOptimizableImage("https://example.com/hero.jpg")).toBe(false)
    expect(isOptimizableImage("//example.com/hero.jpg")).toBe(false)
    expect(
      isOptimizableImage("http://abc.public.blob.vercel-storage.com/a.jpg")
    ).toBe(false)
    expect(
      isOptimizableImage("https://public.blob.vercel-storage.com.evil.com/a")
    ).toBe(false)
  })

  test("rejects garbage", () => {
    expect(isOptimizableImage("")).toBe(false)
    expect(isOptimizableImage("not a url")).toBe(false)
  })
})
