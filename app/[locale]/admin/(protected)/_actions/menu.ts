"use server"

import { revalidatePath, updateTag } from "next/cache"

import { routing, type Locale } from "@/i18n/routing"
import { ForbiddenError, requireAdmin } from "@/lib/auth-guards"
import * as services from "@/lib/services"

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

function readTranslation(
  formData: FormData,
  field: string,
  locale: Locale
): string | null {
  const raw = formData.get(`${field}.${locale}`)
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

// ---------- Categories ----------

async function syncCategoryTranslations(
  menuCategoryId: string,
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
      menuCategoryId,
      locale,
      title: readTranslation(formData, "title", locale),
      aiGenerated: aiFlag,
      aiGeneratedAt: aiFlag ? now : null,
      reviewedAt: locale === routing.defaultLocale ? null : aiFlag ? null : now,
    }
    const result = await services.menu.upsertCategoryTranslation(payload)
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

export async function saveMenuCategoryAction(
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

  const sortOrder = readNumber(formData, "sortOrder")
  const id = readString(formData, "id")

  let categoryId: string
  if (id) {
    const updateResult = await services.menu.updateCategory({
      id,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
    })
    if (!updateResult.ok) {
      return { status: "error", fieldErrors: updateResult.fieldErrors }
    }
    applyTags(updateResult.revalidateTags, slug)
    categoryId = id
  } else {
    const createResult = await services.menu.createCategory({
      branchId,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    if (!createResult.ok) {
      return { status: "error", fieldErrors: createResult.fieldErrors }
    }
    applyTags(createResult.revalidateTags, slug)
    categoryId = createResult.data.id
  }

  const translationErrors = await syncCategoryTranslations(
    categoryId,
    formData,
    slug
  )
  if (translationErrors) {
    return { status: "error", fieldErrors: translationErrors }
  }

  return { status: "success", data: { id: categoryId } }
}

export async function deleteMenuCategoryAction(
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
    return { status: "error", fieldErrors: { id: ["missing category id"] } }
  }
  const result = await services.menu.removeCategory(id)
  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }
  applyTags(result.revalidateTags, slug)
  return { status: "success", data: result.data }
}

export async function reorderMenuCategoriesAction(
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

  const result = await services.menu.reorderCategories(branchId, items)
  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }
  applyTags(result.revalidateTags, slug)
  return { status: "success", data: result.data }
}

// ---------- Items ----------

async function syncItemTranslations(
  menuItemId: string,
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
      menuItemId,
      locale,
      name: readTranslation(formData, "name", locale),
      tag: readTranslation(formData, "tag", locale),
      aiGenerated: aiFlag,
      aiGeneratedAt: aiFlag ? now : null,
      reviewedAt: locale === routing.defaultLocale ? null : aiFlag ? null : now,
    }
    const result = await services.menu.upsertItemTranslation(payload)
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

export async function saveMenuItemAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const categoryId = readString(formData, "categoryId")
  const slug = readString(formData, "slug")
  if (!categoryId || !slug) {
    return {
      status: "error",
      fieldErrors: { categoryId: ["missing category context"] },
    }
  }

  const amountCents = readNumber(formData, "amountCents")
  const sortOrder = readNumber(formData, "sortOrder")
  const id = readString(formData, "id")

  let itemId: string
  if (id) {
    const updateResult = await services.menu.updateItem({
      id,
      amountCents,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
    })
    if (!updateResult.ok) {
      return { status: "error", fieldErrors: updateResult.fieldErrors }
    }
    applyTags(updateResult.revalidateTags, slug)
    itemId = id
  } else {
    const createResult = await services.menu.createItem({
      categoryId,
      amountCents,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    if (!createResult.ok) {
      return { status: "error", fieldErrors: createResult.fieldErrors }
    }
    applyTags(createResult.revalidateTags, slug)
    itemId = createResult.data.id
  }

  const translationErrors = await syncItemTranslations(itemId, formData, slug)
  if (translationErrors) {
    return { status: "error", fieldErrors: translationErrors }
  }

  return { status: "success", data: { id: itemId } }
}

export async function deleteMenuItemAction(
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
    return { status: "error", fieldErrors: { id: ["missing item id"] } }
  }
  const result = await services.menu.removeItem(id)
  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }
  applyTags(result.revalidateTags, slug)
  return { status: "success", data: result.data }
}

export async function reorderMenuItemsAction(
  categoryId: string,
  slug: string,
  items: { id: string; sortOrder: number }[]
): Promise<FormState<{ count: number }>> {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) return forbiddenState()
    throw error
  }

  const result = await services.menu.reorderItems(categoryId, items)
  if (!result.ok) {
    return { status: "error", fieldErrors: result.fieldErrors }
  }
  applyTags(result.revalidateTags, slug)
  return { status: "success", data: result.data }
}
