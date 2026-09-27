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
