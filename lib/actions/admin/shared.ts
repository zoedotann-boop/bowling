import { z } from "zod"

export type ActionResult = { ok: true } | { ok: false; error: string }

export const OK: ActionResult = { ok: true }

export function readSlug(input: unknown): string {
  if (
    typeof input === "object" &&
    input !== null &&
    "slug" in input &&
    typeof (input as { slug: unknown }).slug === "string"
  ) {
    return (input as { slug: string }).slug
  }
  return ""
}

export const localizedSchema = z.object({
  he: z.string(),
  en: z.string().optional(),
})

export const rowIdSchema = z.uuid().optional()
