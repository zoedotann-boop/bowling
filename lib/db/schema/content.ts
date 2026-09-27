import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { localized, timestamps } from "./_shared"
import { location } from "./locations"

// Singleton content for a location's home page. Keyed by locationId (one row
// per location).
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
  aboutImageUrl: text("about_image_url"),
  ...timestamps,
})

// Pricing section ("כמה עולה לשחק?") for a location's home page. One row per
// location. Price values are localized text (e.g. "35 ₪" / "₪ 35") so the
// currency placement can follow the language, matching the rest of the site.
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

// Site-wide chrome copy (footer, contact intro) for a location.
export const siteContent = pgTable("site_content", {
  locationId: uuid("location_id")
    .primaryKey()
    .references(() => location.id, { onDelete: "cascade" }),
  contactTitle: localized(),
  contactIntro: localized(),
  footerNote: localized(),
  ...timestamps,
})

// Feature-strip items ("what we offer" chips under the hero).
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

// Service cards on the home page.
export const homeService = pgTable("home_service", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "cascade" }),
  title: localized().notNull(),
  description: localized(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

// Customer reviews shown on the home page.
export const homeReview = pgTable("home_review", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "cascade" }),
  author: localized().notNull(),
  quote: localized().notNull(),
  rating: integer("rating").notNull().default(5),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

// Google reviews pulled from Google Maps by the pooler (lib/google/*). Unlike
// homeReview these are single-language (the reviewer's own words) and are keyed
// by Google's stable review id so re-syncs update in place instead of
// duplicating. Only isPublished rows surface on the public site; the admin's
// publish choice is preserved across syncs.
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

// Gallery images for the home page.
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

// Selectable subjects for the public contact form.
export const contactSubject = pgTable("contact_subject", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "cascade" }),
  label: localized().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})
