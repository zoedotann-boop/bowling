"use server"

import { revalidatePath, updateTag } from "next/cache"

import { routing, type Locale } from "@/i18n/routing"
import {
  applyWrite,
  errorState,
  readNumberOr,
  readString,
  successState,
  withAdmin,
} from "@/lib/admin/forms"
import * as services from "@/lib/services"

import type { FormState } from "./types"

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value)
}

export async function saveFooterLinkAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    const branchId = readString(formData, "branchId")
    if (!branchId) {
      return errorState({ branchId: ["missing branch id"] })
    }
    const localeRaw = readString(formData, "locale")
    if (!isLocale(localeRaw)) {
      return errorState({ locale: ["invalid locale"] })
    }
    const locale = localeRaw
    const groupKey = readString(formData, "groupKey")
    const label = readString(formData, "label")
    const href = readString(formData, "href")
    const sortOrder = readNumberOr(formData, "sortOrder", 0)

    const payload = { branchId, locale, groupKey, label, href, sortOrder }
    const result = id
      ? await services.footer.update({ id, ...payload })
      : await services.footer.create(payload)

    if (!result.ok) return errorState(result.fieldErrors)
    for (const tag of result.revalidateTags) updateTag(tag)
    revalidatePath("/[locale]/admin/branches/[slug]/footer", "layout")
    revalidatePath("/[locale]", "layout")
    return successState({ id: id || result.data.id })
  })
}

export async function deleteFooterLinkAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    const branchId = readString(formData, "branchId")
    if (!id) return errorState({ id: ["missing link id"] })
    if (!branchId) return errorState({ branchId: ["missing branch id"] })
    const result = await services.footer.remove(id, branchId)
    return applyWrite(
      result,
      "/[locale]/admin/branches/[slug]/footer",
      "/[locale]"
    )
  })
}

export async function reorderFooterLinksAction(
  branchId: string,
  locale: Locale,
  groupKey: string,
  items: { id: string; sortOrder: number }[]
): Promise<FormState<{ count: number }>> {
  return withAdmin(async () => {
    const result = await services.footer.reorder(
      branchId,
      locale,
      groupKey,
      items
    )
    return applyWrite(
      result,
      "/[locale]/admin/branches/[slug]/footer",
      "/[locale]"
    )
  })
}
