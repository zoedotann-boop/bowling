import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/lib/locales"

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
