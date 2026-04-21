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

function readNullableString(formData: FormData, key: string): string | null {
  const v = readString(formData, key)
  return v.length > 0 ? v : null
}

function forbiddenState<T = never>(): FormState<T> {
  return { status: "error", fieldErrors: { _: ["forbidden"] } }
}

function toFormState<T>(result: WriteResult<T>): FormState<T> {
  if (result.ok) {
    for (const tag of result.revalidateTags) updateTag(tag)
    revalidatePath("/[locale]/admin/branches/[slug]/media", "layout")
    return { status: "success", data: result.data }
  }
  return { status: "error", fieldErrors: result.fieldErrors }
}

export async function deleteMediaAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const id = readString(formData, "id")
  const branchId = readString(formData, "branchId")
  if (!id) {
    return { status: "error", fieldErrors: { id: ["missing media id"] } }
  }
  if (!branchId) {
    return {
      status: "error",
      fieldErrors: { branchId: ["missing branch id"] },
    }
  }
  const result = await services.media.remove(id, branchId)
  return toFormState(result)
}

export async function updateMediaAltTextAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const id = readString(formData, "id")
  if (!id) {
    return { status: "error", fieldErrors: { id: ["missing media id"] } }
  }

  const result = await services.media.updateAltText({
    id,
    altTextHe: readNullableString(formData, "altTextHe"),
    altTextEn: readNullableString(formData, "altTextEn"),
    altTextRu: readNullableString(formData, "altTextRu"),
    altTextAr: readNullableString(formData, "altTextAr"),
  })

  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }
  for (const tag of result.revalidateTags) updateTag(tag)
  revalidatePath("/[locale]/admin/branches/[slug]/media", "layout")
  return { status: "success", data: { id: result.data.id } }
}
