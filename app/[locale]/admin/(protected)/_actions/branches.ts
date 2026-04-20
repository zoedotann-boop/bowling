"use server"

import { revalidatePath, updateTag } from "next/cache"

import { routing, type Locale } from "@/i18n/routing"
import { ForbiddenError, requireAdmin } from "@/lib/auth-guards"
import * as services from "@/lib/services"
import type { WriteResult } from "@/lib/services"

import type { FormState } from "./types"

const TRANSLATABLE_FIELDS = [
  "displayName",
  "shortName",
  "address",
  "city",
  "heroHeadline",
  "heroTagline",
  "seoTitle",
  "seoDescription",
] as const

type TranslatableField = (typeof TRANSLATABLE_FIELDS)[number]

function readTranslation(
  formData: FormData,
  field: TranslatableField,
  locale: Locale
): string | null {
  const raw = formData.get(`${field}.${locale}`)
  if (typeof raw !== "string") return null
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

function readString(formData: FormData, key: string): string {
  const v = formData.get(key)
  return typeof v === "string" ? v.trim() : ""
}

function readOptionalString(formData: FormData, key: string): string | null {
  const v = readString(formData, key)
  return v.length > 0 ? v : null
}

function readNumber(formData: FormData, key: string): number {
  const v = formData.get(key)
  const n = typeof v === "string" ? Number(v) : NaN
  return Number.isFinite(n) ? n : NaN
}

function toFormState<T>(result: WriteResult<T>): FormState<T> {
  if (result.ok) {
    for (const tag of result.revalidateTags) updateTag(tag)
    revalidatePath("/[locale]/admin/branches", "layout")
    const state: FormState<T> = { status: "success", data: result.data }
    return state
  }
  return { status: "error", fieldErrors: result.fieldErrors }
}

function forbiddenState<T = never>(): FormState<T> {
  return { status: "error", fieldErrors: { _: ["forbidden"] } }
}

function baseBranchInput(formData: FormData) {
  return {
    slug: readString(formData, "slug"),
    phone: readString(formData, "phone"),
    whatsapp: readString(formData, "whatsapp"),
    email: readString(formData, "email"),
    mapUrl: readString(formData, "mapUrl"),
    latitude: readNumber(formData, "latitude"),
    longitude: readNumber(formData, "longitude"),
    brandAccent: readString(formData, "brandAccent") as "cherry" | "teal",
    heroImageId: readOptionalString(formData, "heroImageId"),
    googlePlaceId: readOptionalString(formData, "googlePlaceId"),
    published: formData.get("published") === "on",
    sortOrder: Number.isFinite(readNumber(formData, "sortOrder"))
      ? readNumber(formData, "sortOrder")
      : 0,
  }
}

function translationsForBranch(formData: FormData, branchId: string) {
  const now = new Date()
  return routing.locales.map((locale) => {
    const base = {
      branchId,
      locale,
      ...Object.fromEntries(
        TRANSLATABLE_FIELDS.map((field) => [
          field,
          readTranslation(formData, field, locale),
        ])
      ),
    }
    if (locale === routing.defaultLocale) {
      return {
        ...base,
        aiGenerated: false,
        aiGeneratedAt: null,
        reviewedAt: null,
      }
    }
    const aiFlag = formData.get(`aiGenerated.${locale}`) === "1"
    return {
      ...base,
      aiGenerated: aiFlag,
      aiGeneratedAt: aiFlag ? now : null,
      reviewedAt: aiFlag ? null : now,
    }
  })
}

export async function createBranchAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string; slug: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const createResult = await services.branches.create(baseBranchInput(formData))
  if (!createResult.ok) {
    return { status: "error", fieldErrors: createResult.fieldErrors }
  }

  const translations = translationsForBranch(formData, createResult.data.id)
  const translationErrors: Record<string, string[]> = {}
  for (const payload of translations) {
    const tr = await services.branches.upsertTranslation(payload)
    if (!tr.ok) {
      for (const [k, v] of Object.entries(tr.fieldErrors)) {
        translationErrors[`${k}.${payload.locale}`] = v
      }
    }
  }

  for (const tag of createResult.revalidateTags) updateTag(tag)
  revalidatePath("/[locale]/admin/branches", "layout")

  if (Object.keys(translationErrors).length > 0) {
    return { status: "error", fieldErrors: translationErrors }
  }

  return { status: "success", data: createResult.data }
}

export async function updateBranchAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string; slug: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const id = readString(formData, "id")
  if (!id) {
    return { status: "error", fieldErrors: { id: ["missing branch id"] } }
  }

  const updateResult = await services.branches.update({
    id,
    ...baseBranchInput(formData),
  })
  if (!updateResult.ok) {
    return { status: "error", fieldErrors: updateResult.fieldErrors }
  }

  const translations = translationsForBranch(formData, id)
  const translationErrors: Record<string, string[]> = {}
  for (const payload of translations) {
    const tr = await services.branches.upsertTranslation(payload)
    if (!tr.ok) {
      for (const [k, v] of Object.entries(tr.fieldErrors)) {
        translationErrors[`${k}.${payload.locale}`] = v
      }
    }
  }

  for (const tag of updateResult.revalidateTags) updateTag(tag)
  revalidatePath("/[locale]/admin/branches", "layout")

  if (Object.keys(translationErrors).length > 0) {
    return { status: "error", fieldErrors: translationErrors }
  }

  return { status: "success", data: updateResult.data }
}

export async function setBranchPublishedAction(
  formData: FormData
): Promise<FormState<{ id: string; slug: string; published: boolean }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const result = await services.branches.setPublished({
    id: readString(formData, "id"),
    published: formData.get("published") === "true",
  })
  return toFormState(result)
}

export async function reorderBranchesAction(
  items: { id: string; sortOrder: number }[]
): Promise<FormState<{ count: number }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const result = await services.branches.reorder(items)
  return toFormState(result)
}

export async function updateBranchContactAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string; slug: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const id = readString(formData, "id")
  if (!id) {
    return { status: "error", fieldErrors: { id: ["missing branch id"] } }
  }

  const result = await services.branches.update({
    id,
    phone: readString(formData, "phone"),
    whatsapp: readString(formData, "whatsapp"),
    email: readString(formData, "email"),
    mapUrl: readString(formData, "mapUrl"),
  })
  return toFormState(result)
}

export async function deleteBranchAction(
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
    return { status: "error", fieldErrors: { id: ["missing branch id"] } }
  }
  const result = await services.branches.remove(id)
  return toFormState(result)
}

export async function bulkUpsertHoursAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ count: number }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const branchId = readString(formData, "branchId")
  if (!branchId) {
    return { status: "error", fieldErrors: { branchId: ["missing branch id"] } }
  }

  const rows = [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
    const isClosed = formData.get(`isClosed.${dayOfWeek}`) === "on"
    const openTime = readString(formData, `openTime.${dayOfWeek}`)
    const closeTime = readString(formData, `closeTime.${dayOfWeek}`)
    return {
      dayOfWeek,
      isClosed,
      openTime: isClosed ? null : openTime || null,
      closeTime: isClosed ? null : closeTime || null,
    }
  })

  const result = await services.hours.bulkUpsert(branchId, rows)
  return toFormState(result)
}
