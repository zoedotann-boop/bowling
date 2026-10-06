import "server-only"

import type { BranchId } from "@/lib/branches"
import type { SiteEventType } from "@/lib/db/queries/site"
import {
  defaultEventTitle,
  defaultFormFields,
} from "@/lib/events/detail-defaults"
import { usesContactForm } from "@/lib/events/slugs"
import { pickLocale } from "@/lib/localized"
import type { Locale } from "@/lib/locales"

export function waiverEventTitle({
  branchId,
  slug,
  locale,
  eventTypes,
  branchEvents,
}: {
  branchId: BranchId
  slug: string
  locale: Locale
  eventTypes: SiteEventType[]
  branchEvents: string[]
}): string | null {
  if (usesContactForm(slug)) return null

  const eventType = eventTypes.find((type) => type.slug === slug)
  const available = eventTypes.length
    ? Boolean(eventType)
    : branchEvents.includes(slug)
  if (!available) return null

  const hasForm =
    Boolean(eventType?.formFields.length) ||
    defaultFormFields(branchId, slug).length > 0
  if (!hasForm) return null

  return (
    pickLocale(eventType?.content?.heroTitle, locale) ||
    pickLocale(defaultEventTitle(branchId, slug), locale) ||
    pickLocale(eventType?.name, locale)
  )
}
