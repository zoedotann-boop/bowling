"use server"

import { revalidatePath, updateTag } from "next/cache"

import { routing } from "@/i18n/routing"
import {
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

function commitToBranch(tags: readonly string[], slug: string) {
  for (const tag of tags) updateTag(tag)
  revalidatePath(`/[locale]/admin/branches/${slug}`, "layout")
}

async function syncEventTranslations(
  eventOfferingId: string,
  formData: FormData,
  slug: string
): Promise<Record<string, string[]> | null> {
  const now = new Date()
  const errors: Record<string, string[]> = {}
  for (const locale of routing.locales) {
    const aiFlag =
      locale !== routing.defaultLocale &&
      formData.get(`aiGenerated.${locale}`) === "1"
    const result = await services.events.upsertTranslation({
      eventOfferingId,
      locale,
      title: readTranslation(formData, "title", locale),
      description: readTranslation(formData, "description", locale),
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

export async function saveEventAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const branchId = readString(formData, "branchId")
    const slug = readString(formData, "slug")
    if (!branchId || !slug) {
      return errorState({ branchId: ["missing branch context"] })
    }

    const imageId = readOptionalString(formData, "imageId")
    const sortOrderRaw = readNumber(formData, "sortOrder")
    const id = readString(formData, "id")

    const writeResult = id
      ? await services.events.update({
          id,
          imageId,
          sortOrder: Number.isFinite(sortOrderRaw) ? sortOrderRaw : undefined,
        })
      : await services.events.create({
          branchId,
          imageId,
          sortOrder: readNumberOr(formData, "sortOrder", 0),
        })

    if (!writeResult.ok) return errorState(writeResult.fieldErrors)
    commitToBranch(writeResult.revalidateTags, slug)
    const eventId = id || writeResult.data.id

    const translationErrors = await syncEventTranslations(
      eventId,
      formData,
      slug
    )
    if (translationErrors) return errorState(translationErrors)
    return successState({ id: eventId })
  })
}

export async function deleteEventAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    const slug = readString(formData, "slug")
    if (!id) return errorState({ id: ["missing event id"] })
    const result = await services.events.remove(id)
    if (!result.ok) return errorState(result.fieldErrors)
    commitToBranch(result.revalidateTags, slug)
    return successState(result.data)
  })
}

export async function reorderEventsAction(
  branchId: string,
  slug: string,
  items: { id: string; sortOrder: number }[]
): Promise<FormState<{ count: number }>> {
  return withAdmin(async () => {
    const result = await services.events.reorder(branchId, items)
    if (!result.ok) return errorState(result.fieldErrors)
    commitToBranch(result.revalidateTags, slug)
    return successState(result.data)
  })
}
