import { getRequestConfig } from "next-intl/server"

// Single-locale setup (Hebrew only) — no i18n routing yet.
export const locales = ["he"] as const
export const defaultLocale = "he"

export default getRequestConfig(async () => {
  const locale = defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
