"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireLocationAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import { getLegalEditor } from "@/lib/db/queries/admin"
import { legalPage } from "@/lib/db/schema"
import {
  isBlankLocalized,
  LEGAL_PAGE_KINDS,
  withoutDefaults,
} from "@/lib/legal"
import { legalDefaults } from "@/lib/legal-defaults"

import { legalSchema } from "./schemas"
import { type ActionResult, OK, readSlug } from "./shared"

export async function saveLegal(input: unknown): Promise<ActionResult> {
  const { location: loc } = await requireLocationAccess(
    readSlug(input),
    "settings"
  )

  const parsed = legalSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }

  const rows = await getLegalEditor(loc.id)
  const existing = new Map(rows.map((row) => [row.kind, row.body]))

  await db.transaction(async (tx) => {
    for (const kind of LEGAL_PAGE_KINDS) {
      const body = withoutDefaults(parsed.data[kind], legalDefaults(kind))
      const current = existing.get(kind)

      if (isBlankLocalized(body)) {
        await tx
          .delete(legalPage)
          .where(
            and(eq(legalPage.locationId, loc.id), eq(legalPage.kind, kind))
          )
        continue
      }

      if (current?.he === body.he && (current.en ?? "") === body.en) continue

      await tx
        .insert(legalPage)
        .values({ locationId: loc.id, kind, body })
        .onConflictDoUpdate({
          target: [legalPage.locationId, legalPage.kind],
          set: { body, updatedAt: new Date() },
        })
    }
  })

  for (const kind of LEGAL_PAGE_KINDS) revalidatePath(`/${kind}`)

  return OK
}
