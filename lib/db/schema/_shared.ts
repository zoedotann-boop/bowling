import { jsonb, timestamp } from "drizzle-orm/pg-core"

import type { Locale } from "@/lib/locales"

export type Localized = Partial<Record<Locale, string>> & { he: string }

export const localized = () => jsonb().$type<Localized>()

export const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}
