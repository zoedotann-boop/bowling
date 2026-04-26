"use server"

import { revalidatePath } from "next/cache"

import {
  applyWrite,
  commitTags,
  errorState,
  readOptionalString,
  readString,
  successState,
  withAdmin,
} from "@/lib/admin/forms"
import * as services from "@/lib/services"

import type { FormState } from "./types"

export async function deleteMediaAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    const branchId = readString(formData, "branchId")
    if (!id) return errorState({ id: ["missing media id"] })
    if (!branchId) return errorState({ branchId: ["missing branch id"] })
    const result = await services.media.remove(id, branchId)
    return applyWrite(result, "/[locale]/admin/branches/[slug]/media")
  })
}

export async function updateMediaAltTextAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    if (!id) return errorState({ id: ["missing media id"] })

    const result = await services.media.updateAltText({
      id,
      altTextHe: readOptionalString(formData, "altTextHe"),
      altTextEn: readOptionalString(formData, "altTextEn"),
      altTextRu: readOptionalString(formData, "altTextRu"),
      altTextAr: readOptionalString(formData, "altTextAr"),
    })

    if (!result.ok) return errorState(result.fieldErrors)
    commitTags(result.revalidateTags)
    revalidatePath("/[locale]/admin/branches/[slug]/media", "layout")
    return successState({ id: result.data.id })
  })
}
