import type { Localized } from "@/lib/db/schema/_shared"

// Field kinds the dynamic event-form engine supports. Single source of truth,
// shared by the Drizzle enum (schema/events.ts) and the zod schema
// (actions/admin/schemas.ts). Pure module — safe on the client.
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

// One option of a `select` field.
export interface FormFieldOption {
  value: string
  label: Localized
}
