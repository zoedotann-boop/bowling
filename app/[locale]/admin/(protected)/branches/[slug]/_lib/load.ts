import { cache } from "react"
import { eq } from "drizzle-orm"

import type { Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import { branch, branchTranslation } from "@/lib/db/schema/content"

export type LoadedBranch = {
  row: typeof branch.$inferSelect
  translations: (typeof branchTranslation.$inferSelect)[]
  displayName: string
}

export const loadBranchBySlug = cache(
  async (slug: string, locale: Locale): Promise<LoadedBranch | null> => {
    const [row] = await db
      .select()
      .from(branch)
      .where(eq(branch.slug, slug))
      .limit(1)
    if (!row) return null

    const translations = await db
      .select()
      .from(branchTranslation)
      .where(eq(branchTranslation.branchId, row.id))

    const displayName =
      translations.find((t) => t.locale === locale)?.displayName ?? row.slug

    return { row, translations, displayName }
  }
)
