import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en", "ru", "he", "ar"],
  defaultLocale: "he",
  localePrefix: "always",
})

export type Locale = (typeof routing.locales)[number]

const rtlLocales: ReadonlySet<Locale> = new Set(["he", "ar"])

export function dirFromLocale(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.has(locale) ? "rtl" : "ltr"
}
