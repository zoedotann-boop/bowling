import type { Localized } from "@/lib/db/schema/_shared"

export const FORM_FIELD_TYPES = [
  "text",
  "textarea",
  "tel",
  "email",
  "id",
  "date",
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
