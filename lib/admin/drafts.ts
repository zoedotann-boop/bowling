import type {
  EventFormFieldDraft,
  PricingDraft,
} from "@/lib/actions/admin/schemas"
import type { Localized } from "@/lib/db/schema/_shared"
import type { DayHours } from "@/lib/db/schema/locations"
import type { BookingFormField } from "@/lib/events/fields"

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
  return Array.from({ length: 7 }, (_, day) => {
    const existing = value?.find((entry) => entry.day === day)
    return existing ?? { day, closed: false, open: "10:00", close: "22:00" }
  })
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
