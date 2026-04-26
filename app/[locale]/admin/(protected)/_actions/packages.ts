"use server"

import { revalidatePath, updateTag } from "next/cache"

import { routing } from "@/i18n/routing"
import {
  errorState,
  readNumber,
  readNumberOr,
  readString,
  readTranslation,
  successState,
  withAdmin,
} from "@/lib/admin/forms"
import * as services from "@/lib/services"

import type { FormState } from "./types"

function commitToBranch(tags: readonly string[], slug: string) {
  for (const tag of tags) updateTag(tag)
  revalidatePath(`/[locale]/admin/branches/${slug}`, "layout")
}

async function syncPackageTranslations(
  packageId: string,
  formData: FormData,
  slug: string
): Promise<Record<string, string[]> | null> {
  const now = new Date()
  const errors: Record<string, string[]> = {}
  for (const locale of routing.locales) {
    const aiFlag =
      locale !== routing.defaultLocale &&
      formData.get(`aiGenerated.${locale}`) === "1"
    const result = await services.packages.upsertTranslation({
      packageId,
      locale,
      title: readTranslation(formData, "title", locale),
      perks: readTranslation(formData, "perks", locale),
      aiGenerated: aiFlag,
      aiGeneratedAt: aiFlag ? now : null,
      reviewedAt: locale === routing.defaultLocale ? null : aiFlag ? null : now,
    })
    if (!result.ok) {
      for (const [k, v] of Object.entries(result.fieldErrors)) {
        errors[`${k}.${locale}`] = v
      }
    } else {
      commitToBranch(result.revalidateTags, slug)
    }
  }
  return Object.keys(errors).length > 0 ? errors : null
}

export async function savePackageAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const branchId = readString(formData, "branchId")
    const slug = readString(formData, "slug")
    if (!branchId || !slug) {
      return errorState({ branchId: ["missing branch context"] })
    }

    const amountCents = readNumber(formData, "amountCents")
    const sortOrderRaw = readNumber(formData, "sortOrder")
    const id = readString(formData, "id")

    const writeResult = id
      ? await services.packages.update({
          id,
          amountCents,
          sortOrder: Number.isFinite(sortOrderRaw) ? sortOrderRaw : undefined,
        })
      : await services.packages.create({
          branchId,
          amountCents,
          sortOrder: readNumberOr(formData, "sortOrder", 0),
        })

    if (!writeResult.ok) return errorState(writeResult.fieldErrors)
    commitToBranch(writeResult.revalidateTags, slug)
    const packageId = id || writeResult.data.id

    const translationErrors = await syncPackageTranslations(
      packageId,
      formData,
      slug
    )
    if (translationErrors) return errorState(translationErrors)
    return successState({ id: packageId })
  })
}

export async function deletePackageAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    const slug = readString(formData, "slug")
    if (!id) return errorState({ id: ["missing package id"] })
    const result = await services.packages.remove(id)
    if (!result.ok) return errorState(result.fieldErrors)
    commitToBranch(result.revalidateTags, slug)
    return successState(result.data)
  })
}

export async function reorderPackagesAction(
  branchId: string,
  slug: string,
  items: { id: string; sortOrder: number }[]
): Promise<FormState<{ count: number }>> {
  return withAdmin(async () => {
    const result = await services.packages.reorder(branchId, items)
    if (!result.ok) return errorState(result.fieldErrors)
    commitToBranch(result.revalidateTags, slug)
    return successState(result.data)
  })
}
