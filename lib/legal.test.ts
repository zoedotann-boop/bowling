import { describe, expect, test } from "bun:test"

import en from "@/messages/en.json"
import he from "@/messages/he.json"

import {
  isBlankLocalized,
  LEGAL_PAGE_KINDS,
  parseLegalBody,
  withDefaults,
  withoutDefaults,
} from "./legal"

const DEFAULTS = { he: "ברירת מחדל", en: "Default" }

describe("parseLegalBody", () => {
  test("returns an empty document for blank input", () => {
    expect(parseLegalBody("")).toEqual({ intro: [], sections: [] })
    expect(parseLegalBody("  \n\n  ")).toEqual({ intro: [], sections: [] })
  })

  test("puts text before the first heading in the intro", () => {
    const doc = parseLegalBody("First paragraph.\n\nSecond paragraph.")
    expect(doc.intro).toEqual([
      { type: "paragraph", text: "First paragraph." },
      { type: "paragraph", text: "Second paragraph." },
    ])
    expect(doc.sections).toEqual([])
  })

  test("splits sections on headings and groups bullets into lists", () => {
    const doc = parseLegalBody(
      ["Intro", "", "## One", "- a", "* b", "• c", "", "## Two", "Text"].join(
        "\n"
      )
    )
    expect(doc.intro).toEqual([{ type: "paragraph", text: "Intro" }])
    expect(doc.sections).toEqual([
      { title: "One", blocks: [{ type: "list", items: ["a", "b", "c"] }] },
      { title: "Two", blocks: [{ type: "paragraph", text: "Text" }] },
    ])
  })

  test("keeps consecutive lines in one paragraph with line breaks", () => {
    const doc = parseLegalBody("## Contact\nCall us:\nPhone: 03\nEmail: x")
    expect(doc.sections[0].blocks).toEqual([
      { type: "paragraph", text: "Call us:\nPhone: 03\nEmail: x" },
    ])
  })

  test("separates a paragraph from an adjacent list without a blank line", () => {
    const doc = parseLegalBody("Lead in:\n- item\nAfter")
    expect(doc.intro).toEqual([
      { type: "paragraph", text: "Lead in:" },
      { type: "list", items: ["item"] },
      { type: "paragraph", text: "After" },
    ])
  })

  test("accepts any heading level, CRLF line endings and extra spaces", () => {
    const doc = parseLegalBody("  ###   Title  \r\n  -   item  \r\n")
    expect(doc.sections).toEqual([
      { title: "Title", blocks: [{ type: "list", items: ["item"] }] },
    ])
  })

  test("treats markers without a following space as plain text", () => {
    const doc = parseLegalBody("#hashtag\n-5 degrees")
    expect(doc.intro).toEqual([
      { type: "paragraph", text: "#hashtag\n-5 degrees" },
    ])
  })

  test("allows an empty section", () => {
    expect(parseLegalBody("## Empty").sections).toEqual([
      { title: "Empty", blocks: [] },
    ])
  })
})

describe("withDefaults", () => {
  test("fills every locale from the defaults when there is no row", () => {
    expect(withDefaults(undefined, DEFAULTS)).toEqual(DEFAULTS)
  })

  test("keeps custom text per locale and fills only the blank ones", () => {
    expect(withDefaults({ he: "מותאם", en: "  " }, DEFAULTS)).toEqual({
      he: "מותאם",
      en: "Default",
    })
    expect(withDefaults({ he: "", en: "Custom" }, DEFAULTS)).toEqual({
      he: "ברירת מחדל",
      en: "Custom",
    })
  })
})

describe("withoutDefaults", () => {
  test("blanks locales whose text still matches the default", () => {
    expect(
      withoutDefaults({ he: "ברירת מחדל", en: "Custom" }, DEFAULTS)
    ).toEqual({ he: "", en: "Custom" })
  })

  test("ignores surrounding whitespace and CRLF when comparing", () => {
    expect(
      withoutDefaults({ he: "  ברירת מחדל\r\n", en: "Default\n" }, DEFAULTS)
    ).toEqual({ he: "", en: "" })
  })

  test("trims kept text and treats a missing locale as blank", () => {
    expect(withoutDefaults({ he: "  חדש  " }, DEFAULTS)).toEqual({
      he: "חדש",
      en: "",
    })
  })

  test("round-trips with withDefaults", () => {
    const custom = { he: "מותאם", en: "" }
    expect(withoutDefaults(withDefaults(custom, DEFAULTS), DEFAULTS)).toEqual(
      custom
    )
  })
})

describe("isBlankLocalized", () => {
  test("is true only when every locale is empty or whitespace", () => {
    expect(isBlankLocalized({ he: "" })).toBe(true)
    expect(isBlankLocalized({ he: " ", en: "\n" })).toBe(true)
    expect(isBlankLocalized({ he: "", en: "x" })).toBe(false)
    expect(isBlankLocalized({ he: "x" })).toBe(false)
  })
})

describe("default legal copy", () => {
  for (const [locale, messages] of Object.entries({ he, en })) {
    for (const kind of LEGAL_PAGE_KINDS) {
      test(`${locale} ${kind} default has an intro and titled sections`, () => {
        const page = messages.legalPages[kind]
        expect(page.title.length).toBeGreaterThan(0)
        const doc = parseLegalBody(page.defaultBody.join("\n"))
        expect(doc.intro.length).toBeGreaterThan(0)
        expect(doc.sections.length).toBeGreaterThan(0)
        for (const section of doc.sections) {
          expect(section.title.length).toBeGreaterThan(0)
          expect(section.blocks.length).toBeGreaterThan(0)
        }
      })
    }
  }
})
