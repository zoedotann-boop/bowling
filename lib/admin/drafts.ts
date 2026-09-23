import type { Localized } from "@/lib/db/schema/_shared"
import type { DayHours } from "@/lib/db/schema/locations"

// Normalizes server rows into draft shape so admin inputs stay controlled:
// a Localized value is always `{ he, en }` with strings (never null/undefined).
export function toLocalized(value: Localized | null | undefined): Localized {
  return { he: value?.he ?? "", en: value?.en ?? "" }
}

// Normalizes stored opening hours into a full Sun→Sat draft so the editor
// always shows all seven days.
export function toHoursDraft(value: DayHours[] | null | undefined): DayHours[] {
  return Array.from({ length: 7 }, (_, day) => {
    const existing = value?.find((entry) => entry.day === day)
    return existing ?? { day, closed: false, open: "10:00", close: "22:00" }
  })
}
