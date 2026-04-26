import { and, asc, eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"

import { db } from "@/lib/db"
import { branch, branchDomain } from "@/lib/db/schema/content"

import { formatZodErrors } from "./errors"
import { createBranchDomainSchema, removeBranchDomainSchema } from "./schemas"
import { tags } from "./tags"
import type { WriteResult } from "./types"

export type BranchDomainRead = {
  id: string
  branchId: string
  host: string
  createdAt: Date
}

function toRead(row: typeof branchDomain.$inferSelect): BranchDomainRead {
  return {
    id: row.id,
    branchId: row.branchId,
    host: row.host,
    createdAt: row.createdAt,
  }
}

export async function listForBranch(
  branchId: string
): Promise<BranchDomainRead[]> {
  const rows = await db
    .select()
    .from(branchDomain)
    .where(eq(branchDomain.branchId, branchId))
    .orderBy(asc(branchDomain.host))
  return rows.map(toRead)
}

export async function findSlugByHost(host: string): Promise<string | null> {
  const normalized = host.trim().toLowerCase()
  if (!normalized) return null
  const load = unstable_cache(
    async () => {
      const [row] = await db
        .select({ slug: branch.slug, published: branch.published })
        .from(branchDomain)
        .innerJoin(branch, eq(branch.id, branchDomain.branchId))
        .where(eq(branchDomain.host, normalized))
        .limit(1)
      if (!row || !row.published) return null
      return row.slug
    },
    ["domains:findSlugByHost", normalized],
    { tags: [tags.domainAll(), tags.domainHost(normalized)] }
  )
  return load()
}

export async function create(
  input: unknown
): Promise<WriteResult<BranchDomainRead>> {
  const parsed = createBranchDomainSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const existing = await db
    .select({ id: branchDomain.id })
    .from(branchDomain)
    .where(eq(branchDomain.host, parsed.data.host))
    .limit(1)
  if (existing.length > 0) {
    return {
      ok: false,
      fieldErrors: { host: ["host already mapped to a branch"] },
    }
  }
  const id = crypto.randomUUID()
  const [row] = await db
    .insert(branchDomain)
    .values({
      id,
      branchId: parsed.data.branchId,
      host: parsed.data.host,
    })
    .returning()
  return {
    ok: true,
    data: toRead(row!),
    revalidateTags: [
      tags.branchDomains(parsed.data.branchId),
      tags.domainAll(),
      tags.domainHost(parsed.data.host),
    ],
  }
}

export async function remove(
  input: unknown
): Promise<WriteResult<{ id: string }>> {
  const parsed = removeBranchDomainSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const [row] = await db
    .delete(branchDomain)
    .where(
      and(
        eq(branchDomain.id, parsed.data.id),
        eq(branchDomain.branchId, parsed.data.branchId)
      )
    )
    .returning()
  if (!row) return { ok: false, fieldErrors: { id: ["domain not found"] } }
  return {
    ok: true,
    data: { id: row.id },
    revalidateTags: [
      tags.branchDomains(row.branchId),
      tags.domainAll(),
      tags.domainHost(row.host),
    ],
  }
}
