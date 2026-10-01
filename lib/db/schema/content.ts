import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { LEGAL_PAGE_KINDS } from "@/lib/legal"

import { localized, timestamps } from "./_shared"
import { location } from "./locations"

export const homeContent = pgTable("home_content", {
  locationId: uuid("location_id")
    .primaryKey()
    .references(() => location.id, { onDelete: "cascade" }),
  heroTitle: localized(),
  heroSubtitle: localized(),
  heroCtaLabel: localized(),
  servicesTitle: localized(),
  servicesIntro: localized(),
  galleryTitle: localized(),
  reviewsTitle: localized(),
  ...timestamps,
})

export const pricingContent = pgTable("pricing_content", {
  locationId: uuid("location_id")
    .primaryKey()
    .references(() => location.id, { onDelete: "cascade" }),
  eyebrow: localized(),
  title: localized(),
  description: localized(),
  weekdaysLabel: localized(),
  weekdaysPrice: localized(),
  weekendLabel: localized(),
  weekendPrice: localized(),
  thirdGameLabel: localized(),
  thirdGameNote: localized(),
  thirdGamePrice: localized(),
  soldierTitle: localized(),
  soldierNote: localized(),
  birthdayEyebrow: localized(),
  birthdayTitle: localized(),
  birthdayDescription: localized(),
  birthdayCtaLabel: localized(),
  ...timestamps,
})

export const siteContent = pgTable("site_content", {
  locationId: uuid("location_id")
    .primaryKey()
    .references(() => location.id, { onDelete: "cascade" }),
  contactTitle: localized(),
  contactIntro: localized(),
  footerNote: localized(),
  ...timestamps,
})

export const homeFeature = pgTable("home_feature", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "cascade" }),
  icon: text("icon").notNull().default(""),
  label: localized().notNull(),
  description: localized(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const homeService = pgTable("home_service", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "cascade" }),
  title: localized().notNull(),
  description: localized(),
  icon: text("icon").notNull().default(""),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const googleReview = pgTable(
  "google_review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => location.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    authorName: text("author_name").notNull().default(""),
    rating: integer("rating").notNull().default(5),
    text: text("text").notNull().default(""),
    publishedAt: timestamp("published_at").notNull().defaultNow(),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("google_review_location_external_idx").on(
      table.locationId,
      table.externalId
    ),
  ]
)

export const galleryImage = pgTable("gallery_image", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull().default(""),
  alt: localized(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const contactSubject = pgTable("contact_subject", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "cascade" }),
  label: localized().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const legalPageKind = pgEnum("legal_page_kind", LEGAL_PAGE_KINDS)

export const legalPage = pgTable(
  "legal_page",
  {
    locationId: uuid("location_id")
      .notNull()
      .references(() => location.id, { onDelete: "cascade" }),
    kind: legalPageKind("kind").notNull(),
    body: localized().notNull(),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.locationId, table.kind] })]
)
