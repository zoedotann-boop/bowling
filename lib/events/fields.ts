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

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const PREVIOUS_EVENING_UNTIL = 6 * 60

function minutesIntoBusinessDay(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  const total = hours * 60 + minutes
  return total < PREVIOUS_EVENING_UNTIL ? total + 24 * 60 : total
}

export function timeOption(time: string): FormFieldOption {
  return { value: time, label: { he: time, en: time } }
}

export function toTimeOptions(times: string[]): FormFieldOption[] {
  return [...new Set(times.map((time) => time.trim()))]
    .filter((time) => TIME_PATTERN.test(time))
    .sort((a, b) => minutesIntoBusinessDay(a) - minutesIntoBusinessDay(b))
    .map(timeOption)
}
