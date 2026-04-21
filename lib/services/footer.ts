import { and, asc, eq } from "drizzle-orm"

import type { Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import { footerLink } from "@/lib/db/schema/content"

import { formatZodErrors } from "./errors"
import {
  createFooterLinkSchema,
  reorderSchema,
  updateFooterLinkSchema,
} from "./schemas"
import { tags } from "./tags"
import type { WriteResult } from "./types"

export type FooterLinkRead = {
  id: string
  branchId: string
  locale: Locale
  groupKey: string
  label: string
  href: string
  sortOrder: number
}

function toRead(row: typeof footerLink.$inferSelect): FooterLinkRead {
  return {
    id: row.id,
    branchId: row.branchId,
    locale: row.locale as Locale,
    groupKey: row.groupKey,
    label: row.label,
    href: row.href,
    sortOrder: row.sortOrder,
  }
}

export async function listByBranch(
  branchId: string
): Promise<FooterLinkRead[]> {
  const rows = await db
    .select()
    .from(footerLink)
    .where(eq(footerLink.branchId, branchId))
    .orderBy(
      asc(footerLink.locale),
      asc(footerLink.groupKey),
      asc(footerLink.sortOrder)
    )
  return rows.map(toRead)
}

export async function create(
  input: unknown
): Promise<WriteResult<FooterLinkRead>> {
  const parsed = createFooterLinkSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const id = crypto.randomUUID()
  const [row] = await db
    .insert(footerLink)
    .values({
      id,
      branchId: parsed.data.branchId,
      locale: parsed.data.locale,
      groupKey: parsed.data.groupKey,
      label: parsed.data.label,
      href: parsed.data.href,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning()
  return {
    ok: true,
    data: toRead(row!),
    revalidateTags: [tags.footerBranch(parsed.data.branchId)],
  }
}

export async function update(
  input: unknown
): Promise<WriteResult<FooterLinkRead>> {
  const parsed = updateFooterLinkSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const { id, ...rest } = parsed.data
  if (Object.keys(rest).length === 0) {
    return { ok: false, fieldErrors: { _: ["no fields to update"] } }
  }
  const [row] = await db
    .update(footerLink)
    .set(rest)
    .where(eq(footerLink.id, id))
    .returning()
  if (!row) return { ok: false, fieldErrors: { id: ["footer link not found"] } }
  return {
    ok: true,
    data: toRead(row),
    revalidateTags: [tags.footerBranch(row.branchId)],
  }
}

export async function remove(
  id: string,
  branchId: string
): Promise<WriteResult<{ id: string }>> {
  const [row] = await db
    .delete(footerLink)
    .where(and(eq(footerLink.id, id), eq(footerLink.branchId, branchId)))
    .returning({ id: footerLink.id, branchId: footerLink.branchId })
  if (!row) return { ok: false, fieldErrors: { id: ["footer link not found"] } }
  return {
    ok: true,
    data: { id: row.id },
    revalidateTags: [tags.footerBranch(row.branchId)],
  }
}

export async function reorder(
  branchId: string,
  locale: Locale,
  groupKey: string,
  items: unknown
): Promise<WriteResult<{ count: number }>> {
  const parsed = reorderSchema.safeParse(items)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  await db.transaction(async (tx) => {
    for (const item of parsed.data) {
      await tx
        .update(footerLink)
        .set({ sortOrder: item.sortOrder })
        .where(
          and(
            eq(footerLink.id, item.id),
            eq(footerLink.branchId, branchId),
            eq(footerLink.locale, locale),
            eq(footerLink.groupKey, groupKey)
          )
        )
    }
  })
  return {
    ok: true,
    data: { count: parsed.data.length },
    revalidateTags: [tags.footerBranch(branchId)],
  }
}
