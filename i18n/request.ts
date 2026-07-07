import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

// Two locales: Hebrew (default, RTL) and English (LTR). The active locale is
// stored in a cookie set by the language toggle in the header.
export const locales = ["he", "en"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "he"

export const LOCALE_COOKIE = "NEXT_LOCALE"

export default getRequestConfig(async () => {
  const store = await cookies()
  const cookieLocale = store.get(LOCALE_COOKIE)?.value
  const locale = locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
