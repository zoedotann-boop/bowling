import { and, asc, eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"

import { db } from "@/lib/db"
import { branch, openingHours } from "@/lib/db/schema/content"

import { formatZodErrors, type WriteResult } from "./_internal"
import { bulkHoursSchema } from "./schemas"
import { tags } from "./tags"

export type OpeningHoursRow = {
  id: string
  dayOfWeek: number
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
}

function toRead(row: typeof openingHours.$inferSelect): OpeningHoursRow {
  return {
    id: row.id,
    dayOfWeek: row.dayOfWeek,
    openTime: row.openTime,
    closeTime: row.closeTime,
    isClosed: row.isClosed,
  }
}

export async function listByBranch(slug: string): Promise<OpeningHoursRow[]> {
  const load = unstable_cache(
    async () => {
      const rows = await db
        .select({ hours: openingHours })
        .from(openingHours)
        .innerJoin(branch, eq(branch.id, openingHours.branchId))
        .where(eq(branch.slug, slug))
        .orderBy(asc(openingHours.dayOfWeek))
      return rows.map((r) => toRead(r.hours))
    },
    ["hours:listByBranch", slug],
    { tags: [tags.branchHours(slug), tags.branch(slug)] }
  )
  return load()
}

async function slugForBranch(branchId: string): Promise<string | null> {
  const [row] = await db
    .select({ slug: branch.slug })
    .from(branch)
    .where(eq(branch.id, branchId))
    .limit(1)
  return row?.slug ?? null
}

export async function bulkUpsert(
  branchId: string,
  rows: unknown
): Promise<WriteResult<{ count: number }>> {
  const parsed = bulkHoursSchema.safeParse(rows)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const slug = await slugForBranch(branchId)
  if (!slug)
    return { ok: false, fieldErrors: { branchId: ["branch not found"] } }

  await db.transaction(async (tx) => {
    for (const row of parsed.data) {
      const existing = await tx
        .select({ id: openingHours.id })
        .from(openingHours)
        .where(
          and(
            eq(openingHours.branchId, branchId),
            eq(openingHours.dayOfWeek, row.dayOfWeek)
          )
        )
        .limit(1)

      if (existing[0]) {
        await tx
          .update(openingHours)
          .set({
            openTime: row.openTime,
            closeTime: row.closeTime,
            isClosed: row.isClosed,
          })
          .where(eq(openingHours.id, existing[0].id))
      } else {
        await tx.insert(openingHours).values({
          id: crypto.randomUUID(),
          branchId,
          dayOfWeek: row.dayOfWeek,
          openTime: row.openTime,
          closeTime: row.closeTime,
          isClosed: row.isClosed,
        })
      }
    }
  })

  return {
    ok: true,
    data: { count: parsed.data.length },
    revalidateTags: [tags.branchHours(slug), tags.branch(slug)],
  }
}
