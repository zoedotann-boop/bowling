import "server-only"

import type { Localized } from "@/lib/db/schema/_shared"
import type { EventDetailTexts } from "@/lib/events/details"
import type { BookingFormField } from "@/lib/events/fields"
import en from "@/messages/en.json"
import he from "@/messages/he.json"

interface MessageEvent {
  allowed?: string[]
  forbidden?: string[]
  rulesFootnote?: string
  policy?: { title: string; desc: string }[]
  policyFootnote?: string
  form?: unknown
}

function messageEvent(
  messages: typeof he.eventDetails,
  branchId: string,
  slug: string
): MessageEvent {
  const branches = messages.branch as Partial<
    Record<string, Partial<Record<string, MessageEvent>>>
  >
  const items = messages.items as Partial<Record<string, MessageEvent>>
  return branches[branchId]?.[slug] ?? items[slug] ?? {}
}

function list(heItems: string[] = [], enItems: string[] = []): Localized[] {
  return heItems.map((item, index) => ({ he: item, en: enItems[index] ?? "" }))
}

export function eventDetailDefaults(
  branchId: string,
  slug: string
): EventDetailTexts {
  const heEvent = messageEvent(he.eventDetails, branchId, slug)
  const enEvent = messageEvent(en.eventDetails, branchId, slug)

  return {
    allowedItems: list(heEvent.allowed, enEvent.allowed),
    forbiddenItems: list(heEvent.forbidden, enEvent.forbidden),
    rulesNote: {
      he: heEvent.rulesFootnote ?? "",
      en: enEvent.rulesFootnote ?? "",
    },
    policyItems: (heEvent.policy ?? []).map((row, index) => ({
      title: { he: row.title, en: enEvent.policy?.[index]?.title ?? "" },
      description: { he: row.desc, en: enEvent.policy?.[index]?.desc ?? "" },
    })),
    policyNote: {
      he: heEvent.policyFootnote ?? "",
      en: enEvent.policyFootnote ?? "",
    },
    formIntro: { he: he.eventDetails.form.desc, en: en.eventDetails.form.desc },
    formTerms: {
      he: he.eventDetails.form.termsConfirm,
      en: en.eventDetails.form.termsConfirm,
    },
    formFootnote: {
      he: he.eventDetails.form.footnote,
      en: en.eventDetails.form.footnote,
    },
  }
}

const DEFAULT_BOOKING_FIELDS = [
  { key: "firstName", message: "firstName", type: "text", isRequired: true },
  { key: "lastName", message: "lastName", type: "text", isRequired: true },
  { key: "idNumber", message: "id", type: "id", isRequired: true },
  { key: "celebrants", message: "celebrants", type: "text", isRequired: false },
  { key: "email", message: "email", type: "email", isRequired: true },
  { key: "phone", message: "phone", type: "tel", isRequired: true },
  { key: "date", message: "date", type: "date", isRequired: true },
] as const

export function defaultBookingFields(): BookingFormField[] {
  const heForm: Partial<Record<string, string>> = he.eventDetails.form
  const enForm: Partial<Record<string, string>> = en.eventDetails.form
  const text = (key: string): Localized => ({
    he: heForm[key] ?? "",
    en: enForm[key] ?? "",
  })

  return DEFAULT_BOOKING_FIELDS.map(({ key, message, type, isRequired }) => ({
    key,
    type,
    label: text(`${message}Label`),
    placeholder: text(`${message}Placeholder`),
    options: null,
    minValue: null,
    maxValue: null,
    isRequired,
  }))
}

export function defaultFormFields(
  branchId: string,
  slug: string
): BookingFormField[] {
  return messageEvent(he.eventDetails, branchId, slug).form
    ? defaultBookingFields()
    : []
}
