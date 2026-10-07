import type { Localized } from "@/lib/db/schema/_shared"

export const FORM_FIELD_TYPES = [
  "text",
  "textarea",
  "tel",
  "email",
  "id",
  "date",
  "time",
  "number",
  "select",
  "checkbox",
] as const

export interface FormFieldOption {
  value: string
  label: Localized
}

export interface BookingFormField {
  key: string
  type: (typeof FORM_FIELD_TYPES)[number]
  label: Localized
  placeholder: Localized | null
  options: FormFieldOption[] | null
  minValue: number | null
  maxValue: number | null
  isRequired: boolean
}

const CORE_FIELD_KEYS = ["firstName", "lastName", "email"]

export function isCoreField(key: string): boolean {
  return CORE_FIELD_KEYS.includes(key)
}

export function newFieldKey(): string {
  return `field_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`
}

const FIRST_TIME_MINUTES = 10 * 60
const LAST_TIME_MINUTES = 20 * 60
const TIME_STEP_MINUTES = 15

export function clockTime(minutes: number): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

export const TIME_OPTIONS: FormFieldOption[] = Array.from(
  { length: (LAST_TIME_MINUTES - FIRST_TIME_MINUTES) / TIME_STEP_MINUTES + 1 },
  (_, index) => {
    const time = clockTime(FIRST_TIME_MINUTES + index * TIME_STEP_MINUTES)
    return { value: time, label: { he: time, en: time } }
  }
)
