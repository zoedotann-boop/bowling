import "server-only"

import type { EventFormFieldDraft } from "@/lib/actions/admin/schemas"
import { toFormFieldDraft } from "@/lib/admin/drafts"
import type { Localized } from "@/lib/db/schema/_shared"
import type { EventDetailTexts } from "@/lib/events/details"
import type { BookingFormField } from "@/lib/events/fields"
import en from "@/messages/en.json"
import he from "@/messages/he.json"

interface MessagePriceOption {
  badge?: string
  days?: string
  label: string
  amount: number
  childrenCount?: number
  extraChildAmount?: number
}

interface MessageEvent {
  title?: string
  badges?: string[]
  scheduleTitle?: string
  price?: { note?: string; options: MessagePriceOption[] }
  showPriceSummary?: boolean
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

export function defaultEventTitle(branchId: string, slug: string): Localized {
  return {
    he: messageEvent(he.eventDetails, branchId, slug).title ?? "",
    en: messageEvent(en.eventDetails, branchId, slug).title ?? "",
  }
}

export function eventDetailDefaults(
  branchId: string,
  slug: string
): EventDetailTexts {
  const heEvent = messageEvent(he.eventDetails, branchId, slug)
  const enEvent = messageEvent(en.eventDetails, branchId, slug)

  return {
    badges: list(heEvent.badges, enEvent.badges),
    scheduleTitle: {
      he: heEvent.scheduleTitle ?? he.eventDetails.scheduleTitle,
      en: enEvent.scheduleTitle ?? en.eventDetails.scheduleTitle,
    },
    priceNote: {
      he: heEvent.price?.note ?? "",
      en: enEvent.price?.note ?? "",
    },
    priceOptions: (heEvent.price?.options ?? []).map((option, index) => {
      const enOption = enEvent.price?.options[index]
      return {
        label: { he: option.label, en: enOption?.label ?? "" },
        days: { he: option.days ?? "", en: enOption?.days ?? "" },
        badge: { he: option.badge ?? "", en: enOption?.badge ?? "" },
        amount: option.amount,
        childrenCount: option.childrenCount ?? null,
        extraChildAmount: option.extraChildAmount ?? null,
      }
    }),
    priceSummaryMode: heEvent.showPriceSummary ? "auto" : "hidden",
    priceSummaryRows: [],
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
    upgradesTitle: {
      he: he.eventDetails.form.upgradesTitle,
      en: en.eventDetails.form.upgradesTitle,
    },
    upgradesNote: {
      he: he.eventDetails.form.upgradesNote,
      en: en.eventDetails.form.upgradesNote,
    },
  }
}

interface DefaultBookingField {
  key: string
  message: string
  type: BookingFormField["type"]
  isRequired: boolean
}

const TIME_FIELD: DefaultBookingField = {
  key: "time",
  message: "time",
  type: "time",
  isRequired: true,
}

const DEFAULT_BOOKING_FIELDS: DefaultBookingField[] = [
  { key: "firstName", message: "firstName", type: "text", isRequired: true },
  { key: "lastName", message: "lastName", type: "text", isRequired: true },
  { key: "idNumber", message: "id", type: "id", isRequired: true },
  { key: "celebrants", message: "celebrants", type: "text", isRequired: false },
  { key: "email", message: "email", type: "email", isRequired: true },
  { key: "phone", message: "phone", type: "tel", isRequired: true },
  { key: "date", message: "date", type: "date", isRequired: true },
  TIME_FIELD,
]

function formText(key: string): Localized {
  const heForm: Partial<Record<string, string>> = he.eventDetails.form
  const enForm: Partial<Record<string, string>> = en.eventDetails.form
  return { he: heForm[key] ?? "", en: enForm[key] ?? "" }
}

function bookingField({
  key,
  message,
  type,
  isRequired,
}: DefaultBookingField): BookingFormField {
  return {
    key,
    type,
    label: formText(`${message}Label`),
    placeholder: formText(`${message}Placeholder`),
    options: null,
    minValue: null,
    maxValue: null,
    isRequired,
  }
}

export function defaultBookingFields(): BookingFormField[] {
  return DEFAULT_BOOKING_FIELDS.map(bookingField)
}

export function withTimeField(
  fields: EventFormFieldDraft[]
): EventFormFieldDraft[] {
  if (fields.length === 0) return fields

  const current = fields.find((field) => field.type === "time")
  const time = toFormFieldDraft({
    ...bookingField(TIME_FIELD),
    id: current?.id,
    key: current?.key ?? TIME_FIELD.key,
  })
  const others = fields.filter((field) => field.type !== "time")
  const at = current
    ? fields.indexOf(current)
    : others.findIndex((field) => field.type === "date") + 1 || others.length

  return [...others.slice(0, at), time, ...others.slice(at)]
}

export function defaultFormFields(
  branchId: string,
  slug: string
): BookingFormField[] {
  return messageEvent(he.eventDetails, branchId, slug).form
    ? defaultBookingFields()
    : []
}
