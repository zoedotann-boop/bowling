"use server"

import { applyWrite, readString, withAdmin } from "@/lib/admin/forms"
import * as services from "@/lib/services"

import type { FormState } from "./types"

export async function createBranchDomainAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string; host: string }>> {
  return withAdmin(async () => {
    const branchId = readString(formData, "branchId")
    const host = readString(formData, "host")
    const result = await services.domains.create({ branchId, host })
    return applyWrite(
      result,
      "/[locale]/admin/branches/[slug]/general",
      "/[locale]"
    )
  })
}

export async function deleteBranchDomainAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    const branchId = readString(formData, "branchId")
    const result = await services.domains.remove({ id, branchId })
    return applyWrite(
      result,
      "/[locale]/admin/branches/[slug]/general",
      "/[locale]"
    )
  })
}
