"use server"

import { revalidatePath, updateTag } from "next/cache"

import { routing } from "@/i18n/routing"
import {
  applyWrite,
  errorState,
  readNumber,
  readNumberOr,
  readOptionalString,
  readString,
  readTranslation,
  successState,
  withAdmin,
} from "@/lib/admin/forms"
import * as services from "@/lib/services"

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

function baseBranchInput(formData: FormData) {
  return {
    slug: readString(formData, "slug"),
    phone: readString(formData, "phone"),
    whatsapp: readString(formData, "whatsapp"),
    email: readString(formData, "email"),
    mapUrl: readString(formData, "mapUrl"),
    latitude: readNumber(formData, "latitude"),
    longitude: readNumber(formData, "longitude"),
    heroImageId: readOptionalString(formData, "heroImageId"),
    googlePlaceId: readOptionalString(formData, "googlePlaceId"),
    published: formData.get("published") === "on",
    sortOrder: readNumberOr(formData, "sortOrder", 0),
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

async function syncBranchTranslations(formData: FormData, branchId: string) {
  const errors: Record<string, string[]> = {}
  for (const payload of translationsForBranch(formData, branchId)) {
    const result = await services.branches.upsertTranslation(payload)
    if (!result.ok) {
      for (const [k, v] of Object.entries(result.fieldErrors)) {
        errors[`${k}.${payload.locale}`] = v
      }
    }
  }
  return errors
}

async function saveBranch(
  id: string | null,
  formData: FormData
): Promise<FormState<{ id: string; slug: string }>> {
  const writeResult = id
    ? await services.branches.update({ id, ...baseBranchInput(formData) })
    : await services.branches.create(baseBranchInput(formData))

  if (!writeResult.ok) return errorState(writeResult.fieldErrors)

  const branchId = writeResult.data.id
  const translationErrors = await syncBranchTranslations(formData, branchId)

  for (const tag of writeResult.revalidateTags) updateTag(tag)
  revalidatePath("/[locale]/admin/branches", "layout")

  if (Object.keys(translationErrors).length > 0) {
    return errorState(translationErrors)
  }
  return successState(writeResult.data)
}

export async function createBranchAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string; slug: string }>> {
  return withAdmin(() => saveBranch(null, formData))
}

export async function updateBranchAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string; slug: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    if (!id) return errorState({ id: ["missing branch id"] })
    return saveBranch(id, formData)
  })
}

export async function deleteBranchAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    if (!id) return errorState({ id: ["missing branch id"] })
    const result = await services.branches.remove(id)
    return applyWrite(result, "/[locale]/admin/branches")
  })
}

export async function bulkUpsertHoursAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ count: number }>> {
  return withAdmin(async () => {
    const branchId = readString(formData, "branchId")
    if (!branchId) return errorState({ branchId: ["missing branch id"] })

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
    return applyWrite(result, "/[locale]/admin/branches")
  })
}
