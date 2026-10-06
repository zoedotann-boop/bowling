import { useLocale, useTranslations } from "next-intl"

import type { EventBooking } from "@/components/booking-form"
import type { Branch } from "@/lib/branches"
import type { SiteEventType } from "@/lib/db/queries/site"
import type { Localized } from "@/lib/db/schema/_shared"
import type { BookingFormField } from "@/lib/events/fields"
import { usesContactForm } from "@/lib/events/slugs"
import { formatPrice, pickLocale } from "@/lib/localized"

interface Step {
  icon: string
  title: string
  desc: string
}
export interface Extra {
  title: string
  desc?: string
  price: string
}
export interface PriceOption {
  badge?: string
  days?: string
  label: string
  amount: number | null
  childrenCount?: number | null
  extraChildAmount?: number | null
}
export interface PolicyRow {
  title: string
  desc: string
}
interface FormConfig {
  countLabel: string
  countPlaceholder: string
  celebrant: boolean
  policyCheckbox: boolean
}
export interface EventItem {
  badges: string[]
  title: string
  lead?: string
  description: string
  schedule?: { note: string; footnote: string; steps: Step[] }
  scheduleTitle?: string
  price?: { note?: string; options: PriceOption[] }
  included?: string[]
  includedTitle?: string
  includedNotes?: string[]
  allowed?: string[]
  forbidden?: string[]
  rulesFootnote?: string
  extras?: Extra[]
  extrasTitle?: string
  extrasNote?: string
  policy?: PolicyRow[]
  policyFootnote?: string
  groupOptions?: string[]
  groupOptionsTitle?: string
  form?: FormConfig
  showPriceSummary?: boolean
}

export function useEventDetail({
  branch,
  slug,
  eventTypes,
  defaultFormFields,
}: {
  branch: Branch
  slug: string
  eventTypes: SiteEventType[]
  defaultFormFields: BookingFormField[]
}) {
  const t = useTranslations("eventDetails")
  const locale = useLocale() as "he" | "en"
  const items = t.raw("items") as Record<string, EventItem>
  const overrides = t.raw("branch") as Record<string, Record<string, EventItem>>
  const messageData: EventItem = overrides?.[branch.id]?.[slug] ??
    items[slug] ?? { badges: [], title: "", description: "" }

  const dbType = eventTypes.find((e) => e.slug === slug)
  const content = dbType?.content
  const pick = (value: Localized) => pickLocale(value, locale)
  const pickOr = <T extends string | undefined>(
    value: Localized | null | undefined,
    fallback: T
  ): string | T => (value ? pick(value) : fallback)
  const money = (amount: number) => formatPrice(amount, locale)
  const priceOptions: PriceOption[] =
    content?.priceOptions?.map((option) => ({
      ...option,
      badge: pick(option.badge),
      days: pick(option.days),
      label: pick(option.label),
    })) ??
    messageData.price?.options ??
    []
  const depositNote =
    content?.depositAmount != null
      ? t("package.deposit", { price: money(content.depositAmount) })
      : undefined
  const priceNote = [
    pickOr(content?.priceNote, messageData.price?.note),
    depositNote,
  ]
    .filter(Boolean)
    .join(" ")
  const summaryMode =
    content?.priceSummaryMode ??
    (messageData.showPriceSummary ? "auto" : "hidden")
  const summaryRows =
    summaryMode === "auto"
      ? priceOptions.flatMap(({ label, amount, childrenCount }) =>
          amount == null
            ? []
            : [
                {
                  label: childrenCount
                    ? `${label} · ${t("package.kids", { count: childrenCount })}`
                    : label,
                  value: money(amount),
                },
              ]
        )
      : summaryMode === "manual"
        ? (content?.priceSummaryRows ?? []).map((row) => ({
            label: pick(row.label),
            value: pick(row.value),
          }))
        : []
  const steps: Step[] = dbType
    ? dbType.steps.map((s) => ({
        icon: "",
        title: pick(s.title),
        desc: pickLocale(s.description, locale),
      }))
    : (messageData.schedule?.steps ?? [])
  const data: EventItem = {
    ...messageData,
    badges: content?.badges?.map(pick).filter(Boolean) ?? messageData.badges,
    title:
      pickLocale(content?.heroTitle, locale) ||
      messageData.title ||
      pickLocale(dbType?.name, locale),
    description:
      pickLocale(content?.heroDescription, locale) || messageData.description,
    schedule: steps.length
      ? {
          note: messageData.schedule?.note ?? "",
          footnote: messageData.schedule?.footnote ?? "",
          steps,
        }
      : undefined,
    included: dbType
      ? dbType.packageLines.map((l) => pick(l.label))
      : messageData.included,
    extras: dbType
      ? dbType.upgrades.map((u) => ({
          title: pick(u.label),
          price: u.amount != null ? money(u.amount) : "",
        }))
      : messageData.extras,
    allowed: content?.allowedItems?.map(pick) ?? messageData.allowed,
    forbidden: content?.forbiddenItems?.map(pick) ?? messageData.forbidden,
    rulesFootnote: pickOr(content?.rulesNote, messageData.rulesFootnote),
    policy:
      content?.policyItems?.map((row) => ({
        title: pick(row.title),
        desc: pick(row.description),
      })) ?? messageData.policy,
    policyFootnote: pickOr(content?.policyNote, messageData.policyFootnote),
  }

  const available = eventTypes.length
    ? Boolean(dbType)
    : branch.events.includes(slug)
  const hasBookingForm =
    !usesContactForm(slug) &&
    Boolean(messageData.form || dbType?.formFields.length)

  const booking: EventBooking | null = hasBookingForm
    ? {
        intro: pickOr(content?.formIntro, t("form.desc")),
        summary: summaryRows.length
          ? { rows: summaryRows, note: depositNote }
          : undefined,
        form: {
          branchId: branch.id,
          event: data.title,
          slug,
          terms:
            pickLocale(content?.formTerms, locale) || t("form.termsConfirm"),
          formFields: dbType?.formFields.length
            ? dbType.formFields
            : defaultFormFields,
          requiresSignature: content?.requiresSignature ?? true,
          upgrades: {
            title:
              pickLocale(content?.upgradesTitle, locale) ||
              t("form.upgradesTitle"),
            note:
              pickLocale(content?.upgradesNote, locale) ||
              t("form.upgradesNote"),
            items: data.extras ?? [],
          },
          footnote: pickOr(content?.formFootnote, t("form.footnote")),
        },
      }
    : null

  return {
    available,
    content,
    messageData,
    data,
    priceOptions,
    priceNote,
    booking,
  }
}
