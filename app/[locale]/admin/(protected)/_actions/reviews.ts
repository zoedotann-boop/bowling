"use server"

import { revalidatePath, updateTag } from "next/cache"

import { errorState, successState, withAdmin } from "@/lib/admin/forms"
import * as services from "@/lib/services"
import type { SyncReviewsResult } from "@/lib/services/reviews"

import type { FormState } from "./types"

export async function syncReviewsAction(
  _prev: FormState<SyncReviewsResult>,
  formData: FormData
): Promise<FormState<SyncReviewsResult>> {
  return withAdmin(async () => {
    const branchId = formData.get("branchId")
    const slug = formData.get("slug")
    if (typeof branchId !== "string" || typeof slug !== "string") {
      return errorState({ _: ["missing branch"] })
    }

    const result = await services.reviews.syncBranch(branchId)
    if (!result.ok) return errorState(result.fieldErrors)

    for (const tag of result.revalidateTags) updateTag(tag)
    revalidatePath(`/[locale]/admin/branches/${slug}`, "layout")
    return successState(result.data)
  })
}
