import { describe, expect, test } from "bun:test"

import { countMissingEnglish, isMissingEnglish, pickLocale } from "./localized"

describe("pickLocale", () => {
  test("falls back to Hebrew when the English is blank", () => {
    expect(pickLocale({ he: "שלום", en: "Hello" }, "en")).toBe("Hello")
    expect(pickLocale({ he: "שלום", en: "  " }, "en")).toBe("שלום")
    expect(pickLocale(null, "en")).toBe("")
  })
})

describe("isMissingEnglish", () => {
  test("flags Hebrew text without English", () => {
    expect(isMissingEnglish({ he: "שלום", en: "" })).toBe(true)
    expect(isMissingEnglish({ he: "שלום", en: " " })).toBe(true)
    expect(isMissingEnglish({ he: "שלום" })).toBe(true)
  })

  test("ignores translated and empty texts", () => {
    expect(isMissingEnglish({ he: "שלום", en: "Hello" })).toBe(false)
    expect(isMissingEnglish({ he: "", en: "" })).toBe(false)
    expect(isMissingEnglish({ he: "  ", en: "Hello" })).toBe(false)
  })
})

describe("countMissingEnglish", () => {
  test("counts every untranslated text in nested drafts", () => {
    const draft = {
      slug: "ramat-gan",
      title: { he: "כותרת", en: "Title" },
      steps: [
        { id: "a", title: { he: "הגעה", en: "" }, isVisible: true },
        { id: "b", title: { he: "", en: "" }, isVisible: true },
      ],
      prices: [
        { amount: 1180, label: { he: "סופ״ש", en: "" }, days: emptyText() },
      ],
      allowedItems: [
        { he: "מרשמלו", en: "" },
        { he: "עוגה", en: "Cake" },
      ],
      note: null,
    }
    expect(countMissingEnglish(draft)).toBe(3)
  })

  test("returns zero for values without texts", () => {
    expect(countMissingEnglish(null)).toBe(0)
    expect(countMissingEnglish("שלום")).toBe(0)
    expect(countMissingEnglish({ id: "x", amount: 5 })).toBe(0)
  })
})

function emptyText() {
  return { he: "", en: "" }
}
