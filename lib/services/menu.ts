import { and, asc, eq, inArray } from "drizzle-orm"
import { unstable_cache } from "next/cache"

import type { Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import {
  branch,
  menuCategory,
  menuCategoryTranslation,
  menuItem,
  menuItemTranslation,
} from "@/lib/db/schema/content"

import {
  formatZodErrors,
  resolveLocalized,
  type ReadResult,
  type WriteResult,
} from "./_internal"
import {
  createMenuCategorySchema,
  createMenuItemSchema,
  reorderSchema,
  updateMenuCategorySchema,
  updateMenuItemSchema,
  upsertMenuCategoryTranslationSchema,
  upsertMenuItemTranslationSchema,
} from "./schemas"
import { tags } from "./tags"

export type MenuItemRead = {
  id: string
  amountCents: number
  sortOrder: number
  name: string | null
  tag: string | null
}

export type MenuCategoryRead = {
  id: string
  sortOrder: number
  title: string | null
  items: MenuItemRead[]
}

export async function listByBranch(
  slug: string,
  locale: Locale
): Promise<ReadResult<MenuCategoryRead[]>> {
  const load = unstable_cache(
    async () => {
      const categoryRows = await db
        .select({ row: menuCategory })
        .from(menuCategory)
        .innerJoin(branch, eq(branch.id, menuCategory.branchId))
        .where(eq(branch.slug, slug))
        .orderBy(asc(menuCategory.sortOrder))

      if (categoryRows.length === 0) {
        return {
          categories: [] as (typeof menuCategory.$inferSelect)[],
          categoryTranslations:
            [] as (typeof menuCategoryTranslation.$inferSelect)[],
          items: [] as (typeof menuItem.$inferSelect)[],
          itemTranslations: [] as (typeof menuItemTranslation.$inferSelect)[],
        }
      }

      const categoryIds = categoryRows.map((r) => r.row.id)
      const [categoryTranslations, items] = await Promise.all([
        db
          .select()
          .from(menuCategoryTranslation)
          .where(inArray(menuCategoryTranslation.menuCategoryId, categoryIds)),
        db
          .select()
          .from(menuItem)
          .where(inArray(menuItem.categoryId, categoryIds))
          .orderBy(asc(menuItem.categoryId), asc(menuItem.sortOrder)),
      ])

      const itemTranslations = items.length
        ? await db
            .select()
            .from(menuItemTranslation)
            .where(
              inArray(
                menuItemTranslation.menuItemId,
                items.map((i) => i.id)
              )
            )
        : []

      return {
        categories: categoryRows.map((r) => r.row),
        categoryTranslations,
        items,
        itemTranslations,
      }
    },
    ["menu:listByBranch", slug],
    { tags: [tags.branchMenu(slug), tags.branch(slug)] }
  )
  const data = await load()

  const allNeedsReview: string[] = []
  const categories: MenuCategoryRead[] = data.categories.map((cat, cIdx) => {
    const catResolved = resolveLocalized<{ title: string | null }>(
      data.categoryTranslations.filter((t) => t.menuCategoryId === cat.id),
      locale,
      ["title"],
      `${cIdx}`
    )
    allNeedsReview.push(...catResolved.needsReview)

    const items = data.items
      .filter((i) => i.categoryId === cat.id)
      .map((item, iIdx) => {
        const itemResolved = resolveLocalized<{
          name: string | null
          tag: string | null
        }>(
          data.itemTranslations.filter((t) => t.menuItemId === item.id),
          locale,
          ["name", "tag"],
          `${cIdx}.items.${iIdx}`
        )
        allNeedsReview.push(...itemResolved.needsReview)
        return {
          id: item.id,
          amountCents: item.amountCents,
          sortOrder: item.sortOrder,
          name: itemResolved.data.name,
          tag: itemResolved.data.tag,
        } satisfies MenuItemRead
      })

    return {
      id: cat.id,
      sortOrder: cat.sortOrder,
      title: catResolved.data.title,
      items,
    }
  })

  return { data: categories, needsReview: allNeedsReview }
}

async function slugForCategory(id: string): Promise<string | null> {
  const [row] = await db
    .select({ slug: branch.slug })
    .from(menuCategory)
    .innerJoin(branch, eq(branch.id, menuCategory.branchId))
    .where(eq(menuCategory.id, id))
    .limit(1)
  return row?.slug ?? null
}

async function slugForItem(id: string): Promise<string | null> {
  const [row] = await db
    .select({ slug: branch.slug })
    .from(menuItem)
    .innerJoin(menuCategory, eq(menuCategory.id, menuItem.categoryId))
    .innerJoin(branch, eq(branch.id, menuCategory.branchId))
    .where(eq(menuItem.id, id))
    .limit(1)
  return row?.slug ?? null
}

async function slugForBranchId(branchId: string): Promise<string | null> {
  const [row] = await db
    .select({ slug: branch.slug })
    .from(branch)
    .where(eq(branch.id, branchId))
    .limit(1)
  return row?.slug ?? null
}

function menuTags(slug: string) {
  return [tags.branchMenu(slug), tags.branch(slug)]
}

// ---------- Category mutations ----------

export async function createCategory(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = createMenuCategorySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForBranchId(parsed.data.branchId)
  if (!slug)
    return { ok: false, fieldErrors: { branchId: ["branch not found"] } }
  const id = crypto.randomUUID()
  await db.insert(menuCategory).values({
    id,
    branchId: parsed.data.branchId,
    sortOrder: parsed.data.sortOrder ?? 0,
  })
  return { ok: true, data: { id }, revalidateTags: menuTags(slug) }
}

export async function updateCategory(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = updateMenuCategorySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const { id, ...rest } = parsed.data
  if (Object.keys(rest).length === 0) {
    return { ok: false, fieldErrors: { _: ["no fields to update"] } }
  }
  const slug = await slugForCategory(id)
  if (!slug) return { ok: false, fieldErrors: { id: ["category not found"] } }
  await db.update(menuCategory).set(rest).where(eq(menuCategory.id, id))
  return { ok: true, data: { id }, revalidateTags: menuTags(slug) }
}

export async function removeCategory(
  id: string
): Promise<WriteResult<{ id: string }>> {
  const slug = await slugForCategory(id)
  if (!slug) return { ok: false, fieldErrors: { id: ["category not found"] } }
  await db.delete(menuCategory).where(eq(menuCategory.id, id))
  return { ok: true, data: { id }, revalidateTags: menuTags(slug) }
}

export async function reorderCategories(
  branchId: string,
  items: unknown
): Promise<WriteResult<{ count: number }>> {
  const parsed = reorderSchema.safeParse(items)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForBranchId(branchId)
  if (!slug)
    return { ok: false, fieldErrors: { branchId: ["branch not found"] } }
  await db.transaction(async (tx) => {
    for (const item of parsed.data) {
      await tx
        .update(menuCategory)
        .set({ sortOrder: item.sortOrder })
        .where(
          and(eq(menuCategory.id, item.id), eq(menuCategory.branchId, branchId))
        )
    }
  })
  return {
    ok: true,
    data: { count: parsed.data.length },
    revalidateTags: menuTags(slug),
  }
}

export async function upsertCategoryTranslation(
  input: unknown
): Promise<WriteResult<{ menuCategoryId: string; locale: string }>> {
  const parsed = upsertMenuCategoryTranslationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForCategory(parsed.data.menuCategoryId)
  if (!slug) {
    return {
      ok: false,
      fieldErrors: { menuCategoryId: ["category not found"] },
    }
  }
  const values = {
    menuCategoryId: parsed.data.menuCategoryId,
    locale: parsed.data.locale,
    title: parsed.data.title ?? null,
    aiGenerated: parsed.data.aiGenerated ?? false,
    aiGeneratedAt: parsed.data.aiGeneratedAt ?? null,
    reviewedAt: parsed.data.reviewedAt ?? null,
  }
  await db
    .insert(menuCategoryTranslation)
    .values(values)
    .onConflictDoUpdate({
      target: [
        menuCategoryTranslation.menuCategoryId,
        menuCategoryTranslation.locale,
      ],
      set: values,
    })
  return {
    ok: true,
    data: {
      menuCategoryId: parsed.data.menuCategoryId,
      locale: parsed.data.locale,
    },
    revalidateTags: menuTags(slug),
  }
}

// ---------- Item mutations ----------

export async function createItem(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = createMenuItemSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForCategory(parsed.data.categoryId)
  if (!slug) {
    return { ok: false, fieldErrors: { categoryId: ["category not found"] } }
  }
  const id = crypto.randomUUID()
  await db.insert(menuItem).values({
    id,
    categoryId: parsed.data.categoryId,
    amountCents: parsed.data.amountCents,
    sortOrder: parsed.data.sortOrder ?? 0,
  })
  return { ok: true, data: { id }, revalidateTags: menuTags(slug) }
}

export async function updateItem(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = updateMenuItemSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const { id, ...rest } = parsed.data
  if (Object.keys(rest).length === 0) {
    return { ok: false, fieldErrors: { _: ["no fields to update"] } }
  }
  const slug = await slugForItem(id)
  if (!slug) return { ok: false, fieldErrors: { id: ["item not found"] } }
  await db.update(menuItem).set(rest).where(eq(menuItem.id, id))
  return { ok: true, data: { id }, revalidateTags: menuTags(slug) }
}

export async function removeItem(
  id: string
): Promise<WriteResult<{ id: string }>> {
  const slug = await slugForItem(id)
  if (!slug) return { ok: false, fieldErrors: { id: ["item not found"] } }
  await db.delete(menuItem).where(eq(menuItem.id, id))
  return { ok: true, data: { id }, revalidateTags: menuTags(slug) }
}

export async function reorderItems(
  categoryId: string,
  items: unknown
): Promise<WriteResult<{ count: number }>> {
  const parsed = reorderSchema.safeParse(items)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForCategory(categoryId)
  if (!slug) {
    return { ok: false, fieldErrors: { categoryId: ["category not found"] } }
  }
  await db.transaction(async (tx) => {
    for (const item of parsed.data) {
      await tx
        .update(menuItem)
        .set({ sortOrder: item.sortOrder })
        .where(
          and(eq(menuItem.id, item.id), eq(menuItem.categoryId, categoryId))
        )
    }
  })
  return {
    ok: true,
    data: { count: parsed.data.length },
    revalidateTags: menuTags(slug),
  }
}

export async function upsertItemTranslation(
  input: unknown
): Promise<WriteResult<{ menuItemId: string; locale: string }>> {
  const parsed = upsertMenuItemTranslationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForItem(parsed.data.menuItemId)
  if (!slug) {
    return { ok: false, fieldErrors: { menuItemId: ["item not found"] } }
  }
  const values = {
    menuItemId: parsed.data.menuItemId,
    locale: parsed.data.locale,
    name: parsed.data.name ?? null,
    tag: parsed.data.tag ?? null,
    aiGenerated: parsed.data.aiGenerated ?? false,
    aiGeneratedAt: parsed.data.aiGeneratedAt ?? null,
    reviewedAt: parsed.data.reviewedAt ?? null,
  }
  await db
    .insert(menuItemTranslation)
    .values(values)
    .onConflictDoUpdate({
      target: [menuItemTranslation.menuItemId, menuItemTranslation.locale],
      set: values,
    })
  return {
    ok: true,
    data: {
      menuItemId: parsed.data.menuItemId,
      locale: parsed.data.locale,
    },
    revalidateTags: menuTags(slug),
  }
}
