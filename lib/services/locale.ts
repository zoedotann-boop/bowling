import { routing, type Locale } from "@/i18n/routing"

const FALLBACK_LOCALE: Locale = routing.defaultLocale

type TranslationRow = {
  locale: string
  aiGenerated?: boolean | null
  reviewedAt?: Date | null
}

function isUsableString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== ""
}

function pathJoin(prefix: string | undefined, field: string): string {
  return prefix ? `${prefix}.${field}` : field
}

export function resolveLocalized<T extends Record<string, string | null>>(
  rows: readonly TranslationRow[],
  locale: Locale,
  fields: readonly (keyof T & string)[],
  pathPrefix?: string
): { data: T; needsReview: string[] } {
  const target = rows.find((r) => r.locale === locale) as
    | (TranslationRow & Partial<Record<keyof T, unknown>>)
    | undefined
  const fallback = rows.find((r) => r.locale === FALLBACK_LOCALE) as
    | (TranslationRow & Partial<Record<keyof T, unknown>>)
    | undefined

  const needsReview: string[] = []
  const data = {} as T
  const targetAiPending =
    target?.aiGenerated === true && (target?.reviewedAt ?? null) === null

  for (const field of fields) {
    const targetVal = target?.[field]
    const fallbackVal = fallback?.[field]

    let value: string | null
    let fieldNeedsReview: boolean

    if (isUsableString(targetVal)) {
      value = targetVal
      fieldNeedsReview = targetAiPending
    } else {
      value = isUsableString(fallbackVal) ? fallbackVal : null
      fieldNeedsReview = true
    }

    ;(data as Record<string, string | null>)[field] = value
    if (fieldNeedsReview) {
      needsReview.push(pathJoin(pathPrefix, field))
    }
  }

  return { data, needsReview }
}

export { FALLBACK_LOCALE }
