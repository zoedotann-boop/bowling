import type { Localized } from "@/lib/db/schema/_shared"
import { formatPrice } from "@/lib/localized"

export interface EventPolicyItem {
  title: Localized
  description: Localized
}

export const PRICE_SUMMARY_MODES = ["auto", "manual", "hidden"] as const
export type PriceSummaryMode = (typeof PRICE_SUMMARY_MODES)[number]

export interface EventSummaryRow {
  label: Localized
  value: Localized
}

export interface EventPriceOption {
  label: Localized
  days: Localized
  badge: Localized
  amount: number | null
  childrenCount: number | null
  extraChildAmount: number | null
  participantsNote?: Localized
}

export interface EventDetailTexts {
  badges: Localized[]
  scheduleTitle: Localized
  priceNote: Localized
  priceOptions: EventPriceOption[]
  priceSummaryMode: PriceSummaryMode
  priceSummaryRows: EventSummaryRow[]
  allowedItems: Localized[]
  forbiddenItems: Localized[]
  rulesNote: Localized
  policyItems: EventPolicyItem[]
  policyNote: Localized
  formIntro: Localized
  formTerms: Localized
  formFootnote: Localized
  upgradesTitle: Localized
  upgradesNote: Localized
}

export function summaryRowsFromPrices(
  options: EventPriceOption[]
): EventSummaryRow[] {
  return options.flatMap(({ label, amount }) =>
    amount == null
      ? []
      : [
          {
            label,
            value: {
              he: formatPrice(amount, "he"),
              en: formatPrice(amount, "en"),
            },
          },
        ]
  )
}

type StoredEventDetailTexts = {
  [K in keyof EventDetailTexts]?: EventDetailTexts[K] | null
}

export function withEventDetailDefaults(
  stored: StoredEventDetailTexts | null | undefined,
  defaults: EventDetailTexts
): EventDetailTexts {
  return {
    badges: stored?.badges ?? defaults.badges,
    scheduleTitle: stored?.scheduleTitle ?? defaults.scheduleTitle,
    priceNote: stored?.priceNote ?? defaults.priceNote,
    priceOptions: stored?.priceOptions ?? defaults.priceOptions,
    priceSummaryMode: stored?.priceSummaryMode ?? defaults.priceSummaryMode,
    priceSummaryRows: stored?.priceSummaryRows ?? defaults.priceSummaryRows,
    allowedItems: stored?.allowedItems ?? defaults.allowedItems,
    forbiddenItems: stored?.forbiddenItems ?? defaults.forbiddenItems,
    rulesNote: stored?.rulesNote ?? defaults.rulesNote,
    policyItems: stored?.policyItems ?? defaults.policyItems,
    policyNote: stored?.policyNote ?? defaults.policyNote,
    formIntro: stored?.formIntro ?? defaults.formIntro,
    formTerms: stored?.formTerms ?? defaults.formTerms,
    formFootnote: stored?.formFootnote ?? defaults.formFootnote,
    upgradesTitle: stored?.upgradesTitle ?? defaults.upgradesTitle,
    upgradesNote: stored?.upgradesNote ?? defaults.upgradesNote,
  }
}
