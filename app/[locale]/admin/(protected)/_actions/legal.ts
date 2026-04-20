"use server"

import { revalidatePath, updateTag } from "next/cache"

import { ForbiddenError, requireAdmin } from "@/lib/auth-guards"
import * as services from "@/lib/services"
import type { WriteResult } from "@/lib/services"

import type { FormState } from "./types"

function readString(formData: FormData, key: string): string {
  const v = formData.get(key)
  return typeof v === "string" ? v.trim() : ""
}

function readOptional(formData: FormData, key: string): string | null {
  const v = readString(formData, key)
  return v.length > 0 ? v : null
}

function readNumber(formData: FormData, key: string): number {
  const v = formData.get(key)
  const n = typeof v === "string" ? Number(v) : NaN
  return Number.isFinite(n) ? n : NaN
}

function forbiddenState<T = never>(): FormState<T> {
  return { status: "error", fieldErrors: { _: ["forbidden"] } }
}

function toState<T>(result: WriteResult<T>, slug?: string): FormState<T> {
  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }
  for (const tag of result.revalidateTags) updateTag(tag)
  revalidatePath("/[locale]/admin/footer", "layout")
  if (slug) revalidatePath(`/[locale]/legal/${slug}`, "page")
  revalidatePath("/[locale]", "layout")
  return { status: "success", data: result.data }
}

export async function saveLegalPageAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ slug: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }
  const slug = readString(formData, "slug")
  const sortOrderRaw = readNumber(formData, "sortOrder")
  const result = await services.legal.upsert({
    slug,
    titleHe: readOptional(formData, "titleHe"),
    titleEn: readOptional(formData, "titleEn"),
    titleRu: readOptional(formData, "titleRu"),
    titleAr: readOptional(formData, "titleAr"),
    bodyMarkdownHe: readOptional(formData, "bodyMarkdownHe"),
    bodyMarkdownEn: readOptional(formData, "bodyMarkdownEn"),
    bodyMarkdownRu: readOptional(formData, "bodyMarkdownRu"),
    bodyMarkdownAr: readOptional(formData, "bodyMarkdownAr"),
    published: formData.get("published") === "on",
    sortOrder: Number.isFinite(sortOrderRaw) ? sortOrderRaw : 0,
  })
  const state = toState(result, slug)
  if (state.status === "error") return state
  return { status: "success", data: { slug } }
}

export async function deleteLegalPageAction(
  formData: FormData
): Promise<FormState<{ slug: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }
  const slug = readString(formData, "slug")
  if (!slug) {
    return { status: "error", fieldErrors: { slug: ["missing slug"] } }
  }
  const result = await services.legal.remove(slug)
  return toState(result, slug)
}
