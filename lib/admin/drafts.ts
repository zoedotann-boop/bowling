import type {
  EventFormFieldDraft,
  PricingDraft,
} from "@/lib/actions/admin/schemas"
import type { Localized } from "@/lib/db/schema/_shared"
import type { DayHours } from "@/lib/db/schema/locations"
import type { BookingFormField } from "@/lib/events/fields"
import { DEFAULT_HOURS } from "@/lib/branches"

export function toLocalized(value: Localized | null | undefined): Localized {
  return { he: value?.he ?? "", en: value?.en ?? "" }
}

type PricingRow = { [K in keyof PricingDraft]?: Localized | null }
export function toPricingDraft(
  row: PricingRow | null | undefined
): PricingDraft {
  return {
    eyebrow: toLocalized(row?.eyebrow),
    title: toLocalized(row?.title),
    description: toLocalized(row?.description),
    weekdaysLabel: toLocalized(row?.weekdaysLabel),
    weekdaysPrice: toLocalized(row?.weekdaysPrice),
    weekendLabel: toLocalized(row?.weekendLabel),
    weekendPrice: toLocalized(row?.weekendPrice),
    thirdGameLabel: toLocalized(row?.thirdGameLabel),
    thirdGameNote: toLocalized(row?.thirdGameNote),
    thirdGamePrice: toLocalized(row?.thirdGamePrice),
    soldierTitle: toLocalized(row?.soldierTitle),
    soldierNote: toLocalized(row?.soldierNote),
    birthdayEyebrow: toLocalized(row?.birthdayEyebrow),
    birthdayTitle: toLocalized(row?.birthdayTitle),
    birthdayDescription: toLocalized(row?.birthdayDescription),
    birthdayCtaLabel: toLocalized(row?.birthdayCtaLabel),
  }
}

export function toHoursDraft(value: DayHours[] | null | undefined): DayHours[] {
  return DEFAULT_HOURS.map(
    (fallback) => value?.find((entry) => entry.day === fallback.day) ?? fallback
  )
}

export function toFormFieldDraft(
  field: BookingFormField & { id?: string; isVisible?: boolean }
): EventFormFieldDraft {
  return {
    id: field.id,
    key: field.key,
    label: toLocalized(field.label),
    placeholder: toLocalized(field.placeholder),
    type: field.type,
    options: (field.options ?? []).map((option) => ({
      value: option.value,
      label: toLocalized(option.label),
    })),
    minValue: field.minValue,
    maxValue: field.maxValue,
    isRequired: field.isRequired,
    isVisible: field.isVisible ?? true,
  }
}

export function parseWholeNumber(value: string): number | null {
  if (value.trim() === "") return null
  const number = Math.round(Number(value))
  return Number.isFinite(number) ? number : null
}
