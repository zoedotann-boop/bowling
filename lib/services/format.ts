import type { Locale } from "@/i18n/routing"

const CURRENCY = "ILS"

const formatters = new Map<Locale, Intl.NumberFormat>()

function formatterFor(locale: Locale): Intl.NumberFormat {
  let fmt = formatters.get(locale)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 0,
    })
    formatters.set(locale, fmt)
  }
  return fmt
}

export function formatAmount(cents: number, locale: Locale): string {
  return formatterFor(locale).format(cents / 100)
}
