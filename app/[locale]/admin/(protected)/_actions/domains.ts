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

function forbiddenState<T = never>(): FormState<T> {
  return { status: "error", fieldErrors: { _: ["forbidden"] } }
}

function applyTags<T>(result: WriteResult<T>): FormState<T> {
  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }
  for (const tag of result.revalidateTags) updateTag(tag)
  revalidatePath("/[locale]/admin/branches/[slug]/domains", "layout")
  revalidatePath("/[locale]", "layout")
  return { status: "success", data: result.data }
}

export async function createBranchDomainAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string; host: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }
  const branchId = readString(formData, "branchId")
  const host = readString(formData, "host")
  const result = await services.domains.create({ branchId, host })
  const state = applyTags(result)
  if (state.status === "error") return state
  return {
    status: "success",
    data: result.ok
      ? { id: result.data.id, host: result.data.host }
      : undefined,
  }
}

export async function deleteBranchDomainAction(
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
  const result = await services.domains.remove({ id, branchId })
  return applyTags(result)
}
