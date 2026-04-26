import { revalidatePath, updateTag } from "next/cache"

import type { Locale } from "@/i18n/routing"
import { ForbiddenError, requireAdmin } from "@/lib/auth-guards"
import type { FieldErrors, WriteResult } from "@/lib/services"

import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"

export function readString(formData: FormData, key: string): string {
  const v = formData.get(key)
  return typeof v === "string" ? v.trim() : ""
}

export function readOptionalString(
  formData: FormData,
  key: string
): string | null {
  const v = readString(formData, key)
  return v.length > 0 ? v : null
}

export function readNumber(formData: FormData, key: string): number {
  const v = formData.get(key)
  const n = typeof v === "string" ? Number(v) : NaN
  return Number.isFinite(n) ? n : NaN
}

export function readNumberOr(
  formData: FormData,
  key: string,
  fallback: number
): number {
  const n = readNumber(formData, key)
  return Number.isFinite(n) ? n : fallback
}

export function readTranslation(
  formData: FormData,
  field: string,
  locale: Locale
): string | null {
  return readOptionalString(formData, `${field}.${locale}`)
}

export const forbiddenState = <T = never>(): FormState<T> => ({
  status: "error",
  fieldErrors: { _: ["forbidden"] },
})

export const errorState = <T = never>(
  fieldErrors: FieldErrors
): FormState<T> => ({ status: "error", fieldErrors })

export const successState = <T>(data: T): FormState<T> => ({
  status: "success",
  data,
})

type Session = Awaited<ReturnType<typeof requireAdmin>>

export async function withAdmin<R>(
  body: (session: Session) => Promise<FormState<R>>
): Promise<FormState<R>> {
  try {
    const session = await requireAdmin()
    return await body(session)
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState<R>()
    throw error
  }
}

export function commitTags(tags: readonly string[]): void {
  for (const tag of tags) updateTag(tag)
}

export function commitPaths(
  paths: readonly (string | { path: string; type: "layout" | "page" })[]
): void {
  for (const p of paths) {
    if (typeof p === "string") revalidatePath(p, "layout")
    else revalidatePath(p.path, p.type)
  }
}

export function applyWrite<T>(
  result: WriteResult<T>,
  ...paths: (string | { path: string; type: "layout" | "page" })[]
): FormState<T> {
  if (!result.ok) return errorState(result.fieldErrors)
  commitTags(result.revalidateTags)
  commitPaths(paths)
  return successState(result.data)
}
