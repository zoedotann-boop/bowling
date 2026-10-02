import type { Localized } from "@/lib/db/schema/_shared"
import { emptyLocalized, formatPrice, pickLocale } from "@/lib/localized"
import type { Locale } from "@/lib/locales"

export interface MenuItemPrice {
  label: Localized
  amount: number | null
  isVisible: boolean
}

export interface DisplayPrice {
  label: string
  price: string
}

export function blankPrice(label: Localized = emptyLocalized()): MenuItemPrice {
  return { label, amount: null, isVisible: true }
}

export function blankPricesLike(prices: MenuItemPrice[] = []): MenuItemPrice[] {
  return prices.length
    ? prices.map(({ label }) => blankPrice(label))
    : [blankPrice()]
}

export function displayPrices(
  prices: MenuItemPrice[],
  locale: Locale
): DisplayPrice[] {
  return prices.flatMap(({ label, amount, isVisible }) =>
    isVisible && amount !== null
      ? [
          {
            label: pickLocale(label, locale),
            price: formatPrice(amount, locale),
          },
        ]
      : []
  )
}
