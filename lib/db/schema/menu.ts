import { boolean, integer, pgTable, uuid } from "drizzle-orm/pg-core"

import { localized, timestamps } from "./_shared"
import { location } from "./locations"

// Menu heading/intro for a location (one row per location).
export const menuContent = pgTable("menu_content", {
  locationId: uuid("location_id")
    .primaryKey()
    .references(() => location.id, { onDelete: "cascade" }),
  heading: localized(),
  intro: localized(),
  ...timestamps,
})

// Menu is two-level: category → item. Ordering is driven by `sortOrder`, which
// is (re)assigned from array index on save.
export const menuCategory = pgTable("menu_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "cascade" }),
  label: localized().notNull(),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const menuItem = pgTable("menu_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => menuCategory.id, { onDelete: "cascade" }),
  name: localized().notNull(),
  description: localized(),
  // Whole shekels (integer). Formatted with lib/localized.ts `formatPrice`.
  amount: integer("amount"),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})
