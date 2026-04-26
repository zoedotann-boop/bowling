"use server"

import { revalidatePath, updateTag } from "next/cache"

import {
  errorState,
  readNumberOr,
  readOptionalString,
  readString,
  successState,
  withAdmin,
} from "@/lib/admin/forms"
import * as services from "@/lib/services"
import type { WriteResult } from "@/lib/services"

import type { FormState } from "./types"

function commitLegal<T>(result: WriteResult<T>, slug?: string): FormState<T> {
  if (!result.ok) return errorState(result.fieldErrors)
  for (const tag of result.revalidateTags) updateTag(tag)
  revalidatePath("/[locale]/admin/branches/[slug]/legal", "layout")
  if (slug) revalidatePath(`/[locale]/legal/${slug}`, "page")
  revalidatePath("/[locale]", "layout")
  return successState(result.data)
}

export async function saveLegalPageAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ slug: string }>> {
  return withAdmin(async () => {
    const branchId = readString(formData, "branchId")
    if (!branchId) return errorState({ branchId: ["missing branch id"] })
    const slug = readString(formData, "slug")
    const result = await services.legal.upsert({
      branchId,
      slug,
      titleHe: readOptionalString(formData, "titleHe"),
      titleEn: readOptionalString(formData, "titleEn"),
      titleRu: readOptionalString(formData, "titleRu"),
      titleAr: readOptionalString(formData, "titleAr"),
      bodyMarkdownHe: readOptionalString(formData, "bodyMarkdownHe"),
      bodyMarkdownEn: readOptionalString(formData, "bodyMarkdownEn"),
      bodyMarkdownRu: readOptionalString(formData, "bodyMarkdownRu"),
      bodyMarkdownAr: readOptionalString(formData, "bodyMarkdownAr"),
      published: formData.get("published") === "on",
      sortOrder: readNumberOr(formData, "sortOrder", 0),
    })
    const state = commitLegal(result, slug)
    return state.status === "error" ? state : successState({ slug })
  })
}

export async function deleteLegalPageAction(
  formData: FormData
): Promise<FormState<{ slug: string }>> {
  return withAdmin(async () => {
    const branchId = readString(formData, "branchId")
    const slug = readString(formData, "slug")
    if (!branchId) return errorState({ branchId: ["missing branch id"] })
    if (!slug) return errorState({ slug: ["missing slug"] })
    const result = await services.legal.remove(branchId, slug)
    return commitLegal(result, slug)
  })
}
