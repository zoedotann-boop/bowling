import "server-only"

import type { BranchId } from "@/lib/branches"
import type { Localized } from "@/lib/db/schema/_shared"
import { getEventContent, logError } from "@/lib/db/queries/site"
import {
  bulletList,
  inlineImage,
  noteParagraph,
  sectionHeading,
} from "@/lib/email-template"
import { eventDetailDefaults } from "@/lib/events/detail-defaults"
import {
  withEventDetailDefaults,
  type EventDetailTexts,
} from "@/lib/events/details"
import { pickLocale } from "@/lib/localized"

export const SIGNATURE_CID = "signature"

export async function loadAgreement(
  branchId: BranchId,
  slug: string
): Promise<EventDetailTexts> {
  const defaults = eventDetailDefaults(branchId, slug)
  const content = await getEventContent(branchId, slug).catch(
    logError("getEventContent", null)
  )
  const texts = withEventDetailDefaults(content, defaults)
  return pickLocale(texts.formTerms, "he").trim()
    ? texts
    : { ...texts, formTerms: defaults.formTerms }
}

const he = (value: Localized) => pickLocale(value, "he")

function listSection(title: string, items: string[]): string {
  const filled = items.filter((item) => item.trim() !== "")
  return filled.length ? sectionHeading(title) + bulletList(filled) : ""
}

function note(text: string): string {
  return text.trim() ? noteParagraph(text) : ""
}

export function renderAgreement(
  texts: EventDetailTexts,
  signed: boolean
): string {
  const rules =
    listSection("כללים · מותר להביא", texts.allowedItems.map(he)) +
    listSection("כללים · אסור להביא", texts.forbiddenItems.map(he)) +
    note(he(texts.rulesNote))
  const policy =
    listSection(
      "תנאים · מדיניות הזמנה",
      texts.policyItems.map((row) =>
        [he(row.title), he(row.description)].filter(Boolean).join(" – ")
      )
    ) + note(he(texts.policyNote))
  const confirmation =
    sectionHeading("אישור וחתימה") +
    noteParagraph(`הלקוח/ה אישר/ה: ${he(texts.formTerms)}`) +
    (signed ? inlineImage(SIGNATURE_CID, "חתימת הלקוח/ה") : "")
  return rules + policy + confirmation
}
