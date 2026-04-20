"use server"

import { revalidatePath, updateTag } from "next/cache"

import { routing, type Locale } from "@/i18n/routing"
import { ForbiddenError, requireAdmin } from "@/lib/auth-guards"
import * as services from "@/lib/services"
import type { WriteResult } from "@/lib/services"

import type { FormState } from "./types"

function readString(formData: FormData, key: string): string {
  const v = formData.get(key)
  return typeof v === "string" ? v.trim() : ""
}

function readNumber(formData: FormData, key: string): number {
  const v = formData.get(key)
  const n = typeof v === "string" ? Number(v) : NaN
  return Number.isFinite(n) ? n : NaN
}

function forbiddenState<T = never>(): FormState<T> {
  return { status: "error", fieldErrors: { _: ["forbidden"] } }
}

function applyTags<T>(result: WriteResult<T>): FormState<T> {
  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }
  for (const tag of result.revalidateTags) updateTag(tag)
  revalidatePath("/[locale]/admin/footer", "layout")
  revalidatePath("/[locale]", "layout")
  return { status: "success", data: result.data }
}

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value)
}

export async function saveFooterLinkAction(
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
  const localeRaw = readString(formData, "locale")
  if (!isLocale(localeRaw)) {
    return { status: "error", fieldErrors: { locale: ["invalid locale"] } }
  }
  const locale = localeRaw
  const groupKey = readString(formData, "groupKey")
  const label = readString(formData, "label")
  const href = readString(formData, "href")
  const sortOrderRaw = readNumber(formData, "sortOrder")
  const sortOrder = Number.isFinite(sortOrderRaw) ? sortOrderRaw : 0

  if (id) {
    const result = await services.footer.update({
      id,
      locale,
      groupKey,
      label,
      href,
      sortOrder,
    })
    const state = applyTags(result)
    if (state.status === "error") return state
    return { status: "success", data: { id } }
  }

  const result = await services.footer.create({
    locale,
    groupKey,
    label,
    href,
    sortOrder,
  })
  const state = applyTags(result)
  if (state.status === "error") return state
  return { status: "success", data: { id: result.ok ? result.data.id : "" } }
}

export async function deleteFooterLinkAction(
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
    return { status: "error", fieldErrors: { id: ["missing link id"] } }
  }
  const result = await services.footer.remove(id)
  return applyTags(result)
}

export async function reorderFooterLinksAction(
  locale: Locale,
  groupKey: string,
  items: { id: string; sortOrder: number }[]
): Promise<FormState<{ count: number }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }
  const result = await services.footer.reorder(locale, groupKey, items)
  return applyTags(result)
}
