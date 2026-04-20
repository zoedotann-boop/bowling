import { z } from "zod"

import type { FieldErrors } from "./types"

export function formatZodErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of err.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_"
    if (!out[key]) out[key] = []
    out[key].push(issue.message)
  }
  return out
}
