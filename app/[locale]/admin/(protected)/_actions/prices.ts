"use server"

import { revalidatePath, updateTag } from "next/cache"

import { routing, type Locale } from "@/i18n/routing"
import { ForbiddenError, requireAdmin } from "@/lib/auth-guards"
import * as services from "@/lib/services"

import type { FormState } from "./types"

const PRICE_KINDS = ["hourly", "adult", "child", "shoe"] as const
type PriceKind = (typeof PRICE_KINDS)[number]

function readString(formData: FormData, key: string): string {
  const v = formData.get(key)
  return typeof v === "string" ? v.trim() : ""
}

function readNumber(formData: FormData, key: string): number {
  const v = formData.get(key)
  const n = typeof v === "string" ? Number(v) : NaN
  return Number.isFinite(n) ? n : NaN
}

function readKind(formData: FormData): PriceKind | null {
  const raw = readString(formData, "kind")
  return (PRICE_KINDS as readonly string[]).includes(raw)
    ? (raw as PriceKind)
    : null
}

function readTranslation(formData: FormData, locale: Locale): string | null {
  const raw = formData.get(`label.${locale}`)
  if (typeof raw !== "string") return null
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

function forbiddenState<T = never>(): FormState<T> {
  return { status: "error", fieldErrors: { _: ["forbidden"] } }
}

function applyTags(tags: string[], slug: string) {
  for (const tag of tags) updateTag(tag)
  revalidatePath(`/[locale]/admin/branches/${slug}`, "layout")
}

async function syncTranslations(
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
    const payload = {
      priceRowId,
      locale,
      label: readTranslation(formData, locale),
      aiGenerated: aiFlag,
      aiGeneratedAt: aiFlag ? now : null,
      reviewedAt: locale === routing.defaultLocale ? null : aiFlag ? null : now,
    }
    const result = await services.prices.upsertTranslation(payload)
    if (!result.ok) {
      for (const [k, v] of Object.entries(result.fieldErrors)) {
        errors[`${k}.${locale}`] = v
      }
    } else {
      applyTags(result.revalidateTags, slug)
    }
  }
  return Object.keys(errors).length > 0 ? errors : null
}

export async function savePriceRowAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const branchId = readString(formData, "branchId")
  const slug = readString(formData, "slug")
  if (!branchId || !slug) {
    return {
      status: "error",
      fieldErrors: { branchId: ["missing branch context"] },
    }
  }

  const kind = readKind(formData)
  if (!kind) {
    return { status: "error", fieldErrors: { kind: ["invalid price kind"] } }
  }
  const weekdayAmountCents = readNumber(formData, "weekdayAmountCents")
  const weekendAmountCents = readNumber(formData, "weekendAmountCents")
  const sortOrder = readNumber(formData, "sortOrder")
  const id = readString(formData, "id")

  let priceRowId: string
  if (id) {
    const updateResult = await services.prices.update({
      id,
      kind,
      weekdayAmountCents,
      weekendAmountCents,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
    })
    if (!updateResult.ok) {
      return { status: "error", fieldErrors: updateResult.fieldErrors }
    }
    applyTags(updateResult.revalidateTags, slug)
    priceRowId = id
  } else {
    const createResult = await services.prices.create({
      branchId,
      kind,
      weekdayAmountCents,
      weekendAmountCents,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    if (!createResult.ok) {
      return { status: "error", fieldErrors: createResult.fieldErrors }
    }
    applyTags(createResult.revalidateTags, slug)
    priceRowId = createResult.data.id
  }

  const translationErrors = await syncTranslations(priceRowId, formData, slug)
  if (translationErrors) {
    return { status: "error", fieldErrors: translationErrors }
  }

  return { status: "success", data: { id: priceRowId } }
}

export async function deletePriceRowAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const id = readString(formData, "id")
  const slug = readString(formData, "slug")
  if (!id) {
    return { status: "error", fieldErrors: { id: ["missing price row id"] } }
  }
  const result = await services.prices.remove(id)
  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }
  applyTags(result.revalidateTags, slug)
  return { status: "success", data: result.data }
}

export async function reorderPriceRowsAction(
  branchId: string,
  slug: string,
  items: { id: string; sortOrder: number }[]
): Promise<FormState<{ count: number }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const result = await services.prices.reorder(branchId, items)
  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }
  applyTags(result.revalidateTags, slug)
  return { status: "success", data: result.data }
}
