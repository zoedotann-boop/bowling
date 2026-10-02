import { boolean, integer, jsonb, pgTable, uuid } from "drizzle-orm/pg-core"

import type { MenuItemPrice } from "@/lib/menu"

import { localized, timestamps } from "./_shared"
import { location } from "./locations"

export const menuContent = pgTable("menu_content", {
  locationId: uuid("location_id")
    .primaryKey()
    .references(() => location.id, { onDelete: "cascade" }),
  heading: localized(),
  intro: localized(),
  ...timestamps,
})

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
  prices: jsonb().$type<MenuItemPrice[]>().notNull().default([]),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})
