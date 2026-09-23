import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core"

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
