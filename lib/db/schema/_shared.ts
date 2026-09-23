import { jsonb, timestamp } from "drizzle-orm/pg-core"

import type { Locale } from "@/lib/locales"

// Localized content is stored as a single jsonb column keyed by locale. Hebrew
// (`he`) is the source language and always present; other locales are optional
// and fall back to Hebrew when missing (see lib/localized.ts).
export type Localized = Partial<Record<Locale, string>> & { he: string }

export const localized = () => jsonb().$type<Localized>()

// created/updated timestamps shared by every table. `updatedAt` is bumped
// automatically on write.
export const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}
