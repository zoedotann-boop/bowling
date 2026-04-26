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

const PRICE_KINDS = ["hourly", "adult", "child", "shoe"] as const
type PriceKind = (typeof PRICE_KINDS)[number]

function readKind(formData: FormData): PriceKind | null {
  const raw = readString(formData, "kind")
  return (PRICE_KINDS as readonly string[]).includes(raw)
    ? (raw as PriceKind)
    : null
}

function commitToBranch(tags: readonly string[], slug: string) {
  for (const tag of tags) updateTag(tag)
  revalidatePath(`/[locale]/admin/branches/${slug}`, "layout")
}

async function syncPriceRowTranslations(
  priceRowId: string,
  formData: FormData,
  slug: string
): Promise<Record<string, string[]> | null> {
  const now = new Date()
  const errors: Record<string, string[]> = {}
  for (const locale of routing.locales) {
    const aiFlag =
      locale !== routing.defaultLocale &&
      formData.get(`aiGenerated.${locale}`) === "1"
    const result = await services.prices.upsertTranslation({
      priceRowId,
      locale,
      label: readTranslation(formData, "label", locale),
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

export async function savePriceRowAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const branchId = readString(formData, "branchId")
    const slug = readString(formData, "slug")
    if (!branchId || !slug) {
      return errorState({ branchId: ["missing branch context"] })
    }
    const kind = readKind(formData)
    if (!kind) return errorState({ kind: ["invalid price kind"] })

    const weekdayAmountCents = readNumber(formData, "weekdayAmountCents")
    const weekendAmountCents = readNumber(formData, "weekendAmountCents")
    const sortOrderRaw = readNumber(formData, "sortOrder")
    const id = readString(formData, "id")

    const writeResult = id
      ? await services.prices.update({
          id,
          kind,
          weekdayAmountCents,
          weekendAmountCents,
          sortOrder: Number.isFinite(sortOrderRaw) ? sortOrderRaw : undefined,
        })
      : await services.prices.create({
          branchId,
          kind,
          weekdayAmountCents,
          weekendAmountCents,
          sortOrder: readNumberOr(formData, "sortOrder", 0),
        })

    if (!writeResult.ok) return errorState(writeResult.fieldErrors)
    commitToBranch(writeResult.revalidateTags, slug)
    const priceRowId = id || writeResult.data.id

    const translationErrors = await syncPriceRowTranslations(
      priceRowId,
      formData,
      slug
    )
    if (translationErrors) return errorState(translationErrors)
    return successState({ id: priceRowId })
  })
}

export async function deletePriceRowAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    const slug = readString(formData, "slug")
    if (!id) return errorState({ id: ["missing price row id"] })
    const result = await services.prices.remove(id)
    if (!result.ok) return errorState(result.fieldErrors)
    commitToBranch(result.revalidateTags, slug)
    return successState(result.data)
  })
}

export async function reorderPriceRowsAction(
  branchId: string,
  slug: string,
  items: { id: string; sortOrder: number }[]
): Promise<FormState<{ count: number }>> {
  return withAdmin(async () => {
    const result = await services.prices.reorder(branchId, items)
    if (!result.ok) return errorState(result.fieldErrors)
    commitToBranch(result.revalidateTags, slug)
    return successState(result.data)
  })
}
