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
    const result = await services.menu.upsertCategoryTranslation({
      menuCategoryId,
      locale,
      title: readTranslation(formData, "title", locale),
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

export async function saveMenuCategoryAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const branchId = readString(formData, "branchId")
    const slug = readString(formData, "slug")
    if (!branchId || !slug) {
      return errorState({ branchId: ["missing branch context"] })
    }

    const sortOrderRaw = readNumber(formData, "sortOrder")
    const id = readString(formData, "id")

    const writeResult = id
      ? await services.menu.updateCategory({
          id,
          sortOrder: Number.isFinite(sortOrderRaw) ? sortOrderRaw : undefined,
        })
      : await services.menu.createCategory({
          branchId,
          sortOrder: readNumberOr(formData, "sortOrder", 0),
        })

    if (!writeResult.ok) return errorState(writeResult.fieldErrors)
    commitToBranch(writeResult.revalidateTags, slug)
    const categoryId = id || writeResult.data.id

    const translationErrors = await syncCategoryTranslations(
      categoryId,
      formData,
      slug
    )
    if (translationErrors) return errorState(translationErrors)
    return successState({ id: categoryId })
  })
}

export async function deleteMenuCategoryAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    const slug = readString(formData, "slug")
    if (!id) return errorState({ id: ["missing category id"] })
    const result = await services.menu.removeCategory(id)
    if (!result.ok) return errorState(result.fieldErrors)
    commitToBranch(result.revalidateTags, slug)
    return successState(result.data)
  })
}

export async function reorderMenuCategoriesAction(
  branchId: string,
  slug: string,
  items: { id: string; sortOrder: number }[]
): Promise<FormState<{ count: number }>> {
  return withAdmin(async () => {
    const result = await services.menu.reorderCategories(branchId, items)
    if (!result.ok) return errorState(result.fieldErrors)
    commitToBranch(result.revalidateTags, slug)
    return successState(result.data)
  })
}

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
    const result = await services.menu.upsertItemTranslation({
      menuItemId,
      locale,
      name: readTranslation(formData, "name", locale),
      tag: readTranslation(formData, "tag", locale),
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

export async function saveMenuItemAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const categoryId = readString(formData, "categoryId")
    const slug = readString(formData, "slug")
    if (!categoryId || !slug) {
      return errorState({ categoryId: ["missing category context"] })
    }

    const amountCents = readNumber(formData, "amountCents")
    const sortOrderRaw = readNumber(formData, "sortOrder")
    const id = readString(formData, "id")

    const writeResult = id
      ? await services.menu.updateItem({
          id,
          amountCents,
          sortOrder: Number.isFinite(sortOrderRaw) ? sortOrderRaw : undefined,
        })
      : await services.menu.createItem({
          categoryId,
          amountCents,
          sortOrder: readNumberOr(formData, "sortOrder", 0),
        })

    if (!writeResult.ok) return errorState(writeResult.fieldErrors)
    commitToBranch(writeResult.revalidateTags, slug)
    const itemId = id || writeResult.data.id

    const translationErrors = await syncItemTranslations(itemId, formData, slug)
    if (translationErrors) return errorState(translationErrors)
    return successState({ id: itemId })
  })
}

export async function deleteMenuItemAction(
  formData: FormData
): Promise<FormState<{ id: string }>> {
  return withAdmin(async () => {
    const id = readString(formData, "id")
    const slug = readString(formData, "slug")
    if (!id) return errorState({ id: ["missing item id"] })
    const result = await services.menu.removeItem(id)
    if (!result.ok) return errorState(result.fieldErrors)
    commitToBranch(result.revalidateTags, slug)
    return successState(result.data)
  })
}

export async function reorderMenuItemsAction(
  categoryId: string,
  slug: string,
  items: { id: string; sortOrder: number }[]
): Promise<FormState<{ count: number }>> {
  return withAdmin(async () => {
    const result = await services.menu.reorderItems(categoryId, items)
    if (!result.ok) return errorState(result.fieldErrors)
    commitToBranch(result.revalidateTags, slug)
    return successState(result.data)
  })
}
