import type { Localized } from "@/lib/db/schema/_shared"
import type { Locale } from "@/lib/locales"

// Reads the active locale's value from a Localized field, falling back to the
// Hebrew source when the translation is missing or blank.
export function pickLocale(
  value: Localized | null | undefined,
  locale: Locale
): string {
  if (!value) return ""
  return value[locale]?.trim() || value.he || ""
}

export function emptyLocalized(): Localized {
  return { he: "", en: "" }
}

// Prices are whole shekels stored as integers, e.g. 1234 → "1,234 ₪".
export function formatPrice(amount: number, locale: Locale): string {
  const formatter = new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US")
  return `${formatter.format(amount)} ₪`
}
