import type { Localized } from "@/lib/db/schema/_shared"
import { locales, type Locale } from "@/lib/locales"

export const LEGAL_PAGE_KINDS = ["terms", "accessibility"] as const
export type LegalPageKind = (typeof LEGAL_PAGE_KINDS)[number]

export const LEGAL_DEFAULT_UPDATED_AT: Record<LegalPageKind, string> = {
  terms: "2026-09-27",
  accessibility: "2026-07-01",
}

export type LegalBlock =
  { type: "paragraph"; text: string } | { type: "list"; items: string[] }

interface LegalSection {
  title: string
  blocks: LegalBlock[]
}

export interface LegalDocument {
  intro: LegalBlock[]
  sections: LegalSection[]
}

const HEADING = /^#{1,6}\s+/
const BULLET = /^[-*•]\s+/

export function parseLegalBody(body: string): LegalDocument {
  const doc: LegalDocument = { intro: [], sections: [] }
  let blocks = doc.intro
  let paragraph: string[] = []
  let list: string[] = []

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join("\n") })
    }
    if (list.length) blocks.push({ type: "list", items: list })
    paragraph = []
    list = []
  }

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) {
      flush()
    } else if (HEADING.test(line)) {
      flush()
      const section: LegalSection = {
        title: line.replace(HEADING, ""),
        blocks: [],
      }
      doc.sections.push(section)
      blocks = section.blocks
    } else if (BULLET.test(line)) {
      if (paragraph.length) flush()
      list.push(line.replace(BULLET, ""))
    } else {
      if (list.length) flush()
      paragraph.push(line)
    }
  }
  flush()

  return doc
}

function normalize(text: string | undefined): string {
  return (text ?? "").replace(/\r\n/g, "\n").trim()
}

export function withDefaults(
  value: Localized | undefined,
  defaults: Record<Locale, string>
): Localized {
  const result: Localized = { he: "" }
  for (const locale of locales) {
    result[locale] = value?.[locale]?.trim() || defaults[locale]
  }
  return result
}

export function withoutDefaults(
  value: Localized,
  defaults: Record<Locale, string>
): Localized {
  const result: Localized = { he: "" }
  for (const locale of locales) {
    const text = normalize(value[locale])
    result[locale] = text === normalize(defaults[locale]) ? "" : text
  }
  return result
}

export function isBlankLocalized(value: Localized): boolean {
  return locales.every((locale) => !value[locale]?.trim())
}
