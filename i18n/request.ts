import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/lib/locales"

// Two locales: Hebrew (default, RTL) and English (LTR). The active locale is
// stored in a cookie set by the language toggle in the header. The locale
// definitions live in lib/locales.ts so schema/client code can share them.
export { locales, defaultLocale, LOCALE_COOKIE } from "@/lib/locales"
export type { Locale } from "@/lib/locales"

export default getRequestConfig(async () => {
  const store = await cookies()
  const cookieLocale = store.get(LOCALE_COOKIE)?.value
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
