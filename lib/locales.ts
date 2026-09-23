// Single source of truth for the site's locales. Kept free of any Next.js
// server imports (next/headers, next-intl/server) so it can be imported from
// anywhere — Drizzle schema, drizzle-kit CLI, client components, and the
// next-intl request config alike.

export const locales = ["he", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "he"

// The cookie the header language toggle writes; also read by i18n/request.ts.
export const LOCALE_COOKIE = "NEXT_LOCALE"

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale)
}
