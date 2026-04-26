"use server"

import { z } from "zod"

import { routing, type Locale } from "@/i18n/routing"
import { withAdmin } from "@/lib/admin/forms"
import {
  MAX_FIELDS_PER_CALL,
  TooManyFieldsError,
  translateFields,
} from "@/lib/ai/translate"
import { consume, RateLimitError } from "@/lib/ai/rate-limit"

import type { FormState } from "./types"

const localeSchema = z.enum(routing.locales as readonly [Locale, ...Locale[]])

const inputSchema = z.object({
  sourceLocale: z.literal("he"),
  targets: z.array(localeSchema).min(1),
  fields: z.record(z.string(), z.string()),
  domainHint: z.string().max(120).optional(),
})

export type TranslateFieldsInput = z.infer<typeof inputSchema>
export type TranslatedPayload = Record<Locale, Record<string, string>>

export async function translateBranchFieldsAction(
  input: TranslateFieldsInput
): Promise<FormState<{ translations: TranslatedPayload }>> {
  return withAdmin(async (session) => {
    const parsed = inputSchema.safeParse(input)
    if (!parsed.success) {
      return { status: "error", message: "invalid_input" }
    }
    const { sourceLocale, targets, fields, domainHint } = parsed.data

    const nonEmpty: Record<string, string> = {}
    for (const [k, v] of Object.entries(fields)) {
      const trimmed = typeof v === "string" ? v.trim() : ""
      if (trimmed.length > 0) nonEmpty[k] = trimmed
    }
    if (Object.keys(nonEmpty).length === 0) {
      return { status: "error", message: "empty_source" }
    }
    if (Object.keys(nonEmpty).length > MAX_FIELDS_PER_CALL) {
      return { status: "error", message: "too_many_fields" }
    }

    const uniqueTargets = Array.from(
      new Set(targets.filter((t) => t !== sourceLocale))
    )
    if (uniqueTargets.length === 0) {
      return { status: "error", message: "invalid_input" }
    }

    try {
      consume(session.user.id)
    } catch (error) {
      if (error instanceof RateLimitError) {
        return { status: "error", message: "rate_limit" }
      }
      throw error
    }

    const started = Date.now()
    try {
      const results = await Promise.all(
        uniqueTargets.map(async (target) => {
          const out = await translateFields({
            targetLocale: target,
            fields: nonEmpty,
            domainHint,
          })
          return [target, out] as const
        })
      )
      const translations = Object.fromEntries(results) as TranslatedPayload

      console.info(
        JSON.stringify({
          event: "ai_translate",
          userId: session.user.id,
          targets: uniqueTargets,
          fieldCount: Object.keys(nonEmpty).length,
          ms: Date.now() - started,
        })
      )

      return { status: "success", data: { translations } }
    } catch (error) {
      if (error instanceof TooManyFieldsError) {
        return { status: "error", message: "too_many_fields" }
      }
      console.info(
        JSON.stringify({
          event: "ai_translate_error",
          userId: session.user.id,
          targets: uniqueTargets,
          error: error instanceof Error ? error.message : String(error),
        })
      )
      return { status: "error", message: "gateway_error" }
    }
  })
}
