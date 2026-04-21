"use server"

import { revalidatePath, updateTag } from "next/cache"

import { ForbiddenError, requireAdmin } from "@/lib/auth-guards"
import * as services from "@/lib/services"
import type { SyncReviewsResult } from "@/lib/services/reviews"

import type { FormState } from "./types"

export async function syncReviewsAction(
  _prev: FormState<SyncReviewsResult>,
  formData: FormData
): Promise<FormState<SyncReviewsResult>> {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { status: "error", fieldErrors: { _: ["forbidden"] } }
    }
    throw err
  }

  const branchId = formData.get("branchId")
  const slug = formData.get("slug")
  if (typeof branchId !== "string" || typeof slug !== "string") {
    return { status: "error", fieldErrors: { _: ["missing branch"] } }
  }

  const result = await services.reviews.syncBranch(branchId)
  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }

  for (const tag of result.revalidateTags) updateTag(tag)
  revalidatePath(`/[locale]/admin/branches/${slug}`, "layout")

  return { status: "success", data: result.data }
}
