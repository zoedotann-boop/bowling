import type { Localized } from "@/lib/db/schema/_shared"
import type { Locale } from "@/lib/locales"

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

export function formatPrice(amount: number, locale: Locale): string {
  const formatter = new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US")
  return `${formatter.format(amount)} ₪`
}
