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

// Opening hours for a single weekday, stored as a jsonb array on the location.
// `closed` days omit the open/close times.
export interface DayHours {
  day: number // 0 = Sunday … 6 = Saturday
  closed: boolean
  open?: string // "HH:MM"
  close?: string // "HH:MM"
}

// A location is the multi-tenant root: every piece of content hangs off one.
// The public site's branch data (lib/branches.ts) maps 1:1 onto this table.
export const location = pgTable("location", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),

  name: localized().notNull(),
  addressLine1: localized().notNull(),
  addressLine2: localized(),
  addressFull: localized().notNull(),
  laneDesc: localized(),

  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  // Public contact address shown on the site (footer + contact page mailto).
  email: text("email").notNull().default(""),
  // Inbox that receives inquiries from the contact form and the event
  // commitment form. Empty falls back to the EVENTS_TO_EMAIL env var.
  inquiriesEmail: text("inquiries_email").notNull().default(""),
  wazeUrl: text("waze_url").notNull().default(""),
  logoUrl: text("logo_url"),
  lanes: integer("lanes").notNull().default(0),

  hasGymboree: boolean("has_gymboree").notNull().default(false),
  hasNotice: boolean("has_notice").notNull().default(false),
  noticeTitle: localized(),
  noticeBody: localized(),

  // Google reviews pooler: the branch's Google Maps place identifier and whether
  // the nightly cron auto-publishes freshly fetched high-rated reviews. The
  // SerpApi key that reads them is a shared env var (see lib/google/serpapi.ts).
  googlePlaceId: text("google_place_id"),
  googleReviewsAutoSync: boolean("google_reviews_auto_sync")
    .notNull()
    .default(false),

  hours: jsonb("hours").$type<DayHours[]>(),

  seoTitle: localized(),
  seoDescription: localized(),

  ...timestamps,
})

// Restricts managers/staff to specific locations. Owners bypass membership.
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
