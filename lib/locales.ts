export const locales = ["he", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "he"

export const LOCALE_COOKIE = "NEXT_LOCALE"

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale)
}
