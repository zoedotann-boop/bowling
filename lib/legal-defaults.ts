import "server-only"

import type { LegalPageKind } from "@/lib/legal"
import type { Locale } from "@/lib/locales"
import en from "@/messages/en.json"
import he from "@/messages/he.json"

const MESSAGES = { he, en }

export function legalDefaults(kind: LegalPageKind): Record<Locale, string> {
  return {
    he: MESSAGES.he.legalPages[kind].defaultBody.join("\n"),
    en: MESSAGES.en.legalPages[kind].defaultBody.join("\n"),
  }
}
