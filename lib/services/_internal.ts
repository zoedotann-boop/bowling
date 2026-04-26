import { z } from "zod"

import { routing, type Locale } from "@/i18n/routing"

export type ReadResult<T> = { data: T; needsReview: string[] }

export type FieldErrors = Record<string, string[]>

export type WriteResult<T> =
  | { ok: true; data: T; revalidateTags: string[] }
  | { ok: false; fieldErrors: FieldErrors }

export function formatZodErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of err.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_"
    if (!out[key]) out[key] = []
    out[key].push(issue.message)
  }
  return out
}

const CURRENCY = "ILS"
const formatters = new Map<Locale, Intl.NumberFormat>()

export function formatAmount(cents: number, locale: Locale): string {
  let fmt = formatters.get(locale)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 0,
    })
    formatters.set(locale, fmt)
  }
  return fmt.format(cents / 100)
}

export const FALLBACK_LOCALE: Locale = routing.defaultLocale

type TranslationRow = {
  locale: string
  aiGenerated?: boolean | null
  reviewedAt?: Date | null
}

function isUsableString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== ""
}

export function resolveLocalized<T extends Record<string, string | null>>(
  rows: readonly TranslationRow[],
  locale: Locale,
  fields: readonly (keyof T & string)[],
  pathPrefix?: string
): ReadResult<T> {
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
      needsReview.push(pathPrefix ? `${pathPrefix}.${field}` : field)
    }
  }

  return { data, needsReview }
}
