import { generateText, Output } from "ai"
import { z } from "zod"

import type { Locale } from "@/i18n/routing"

import { LOCALE_NAMES_EN, TRANSLATION_MODEL } from "./gateway"

export const MAX_FIELDS_PER_CALL = 8

export class TooManyFieldsError extends Error {
  constructor() {
    super("too_many_fields")
    this.name = "TooManyFieldsError"
  }
}

const SYSTEM_PROMPT = [
  "You are a professional translator for an Israeli bowling-and-events brand.",
  "Source language is Hebrew (he). Translate to {TARGET_NAME}.",
  "Tone: warm, concise, marketing-grade. Mirror Hebrew sentence rhythm; do NOT pad.",
  "Preserve brand names, numerals, phone formats, URLs, and emoji as-is.",
  "Do NOT translate slugs, place IDs, or text inside backticks.",
  "Output strictly the JSON object matching the requested schema. No commentary.",
  "/* TODO(C.2): glossary lookup from translation_glossary */",
].join("\n")

function buildSchema(fieldNames: string[]) {
  return z.object(
    Object.fromEntries(fieldNames.map((k) => [k, z.string()]))
  ) as z.ZodObject<Record<string, z.ZodString>>
}

export function buildSystem(targetLocale: Locale): string {
  return SYSTEM_PROMPT.replace("{TARGET_NAME}", LOCALE_NAMES_EN[targetLocale])
}

export function buildUserPrompt(args: {
  targetLocale: Locale
  fields: Record<string, string>
  domainHint?: string
}): string {
  const name = LOCALE_NAMES_EN[args.targetLocale]
  return [
    `Domain: bowling alley branch (${args.domainHint ?? "Israel"}).`,
    `Target locale: ${name} (${args.targetLocale}).`,
    "Translate each Hebrew field below. Keep keys identical.",
    "",
    "Fields:",
    JSON.stringify(args.fields, null, 2),
  ].join("\n")
}

export async function translateFields(args: {
  targetLocale: Locale
  fields: Record<string, string>
  domainHint?: string
  abortSignal?: AbortSignal
}): Promise<Record<string, string>> {
  const entries = Object.entries(args.fields).filter(
    ([, v]) => typeof v === "string" && v.trim().length > 0
  )
  if (entries.length === 0) return {}
  if (entries.length > MAX_FIELDS_PER_CALL) throw new TooManyFieldsError()

  const nonEmpty = Object.fromEntries(entries)
  const schema = buildSchema(Object.keys(nonEmpty))

  const { output } = await generateText({
    model: TRANSLATION_MODEL,
    system: buildSystem(args.targetLocale),
    prompt: buildUserPrompt({ ...args, fields: nonEmpty }),
    output: Output.object({ schema }),
    temperature: 0.2,
    maxOutputTokens: 800,
    abortSignal: args.abortSignal,
  })

  return output as Record<string, string>
}
