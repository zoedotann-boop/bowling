import type { Localized } from "@/lib/db/schema/_shared"
import { locales, type Locale } from "@/lib/locales"

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

export function isMissingEnglish(value: Localized): boolean {
  return value.he.trim() !== "" && !value.en?.trim()
}

function isLocalized(value: unknown): value is Localized {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Localized).he === "string" &&
    Object.keys(value).every((key) => locales.includes(key as Locale))
  )
}

export function countMissingEnglish(value: unknown): number {
  if (isLocalized(value)) return isMissingEnglish(value) ? 1 : 0
  if (typeof value !== "object" || value === null) return 0
  return Object.values(value).reduce<number>(
    (total, child) => total + countMissingEnglish(child),
    0
  )
}
