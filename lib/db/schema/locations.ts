import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core"

import { localized, timestamps } from "./_shared"
import { user } from "./auth"

export interface DayHours {
  day: number
  closed: boolean
  open?: string
  close?: string
}

export const location = pgTable("location", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),

  name: localized().notNull(),
  addressLine1: localized().notNull(),
  addressLine2: localized(),
  addressFull: localized().notNull(),

  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  email: text("email").notNull().default(""),
  inquiriesEmail: text("inquiries_email").notNull().default(""),
  wazeUrl: text("waze_url").notNull().default(""),
  logoUrl: text("logo_url"),
  lanes: integer("lanes").notNull().default(0),

  hasGymboree: boolean("has_gymboree").notNull().default(false),
  hasNotice: boolean("has_notice").notNull().default(false),
  noticeTitle: localized(),
  noticeBody: localized(),

  googlePlaceId: text("google_place_id"),
  googleReviewsAutoSync: boolean("google_reviews_auto_sync")
    .notNull()
    .default(false),

  hours: jsonb("hours").$type<DayHours[]>(),

  seoTitle: localized(),
  seoDescription: localized(),

  ...timestamps,
})

export const locationMember = pgTable(
  "location_member",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => location.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.userId, table.locationId] })]
)
