import { relations, sql } from "drizzle-orm"
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { mediaAsset } from "./media"

// ---------- Branch ----------

export const branch = pgTable(
  "branch",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    phone: text("phone").notNull(),
    whatsapp: text("whatsapp").notNull(),
    email: text("email").notNull(),
    mapUrl: text("map_url").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    heroImageId: text("hero_image_id").references(
      (): AnyPgColumn => mediaAsset.id,
      { onDelete: "set null" }
    ),
    googlePlaceId: text("google_place_id"),
    published: boolean("published").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("branch_published_idx").on(table.published, table.sortOrder),
  ]
)

export const branchTranslation = pgTable(
  "branch_translation",
  {
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    displayName: text("display_name"),
    shortName: text("short_name"),
    address: text("address"),
    city: text("city"),
    heroHeadline: text("hero_headline"),
    heroTagline: text("hero_tagline"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    aiGenerated: boolean("ai_generated").default(false).notNull(),
    aiGeneratedAt: timestamp("ai_generated_at"),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    primaryKey({ columns: [table.branchId, table.locale] }),
    index("branch_translation_locale_idx").on(table.locale),
  ]
)

// ---------- Branch domain ----------

export const branchDomain = pgTable(
  "branch_domain",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    host: text("host").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("branch_domain_branch_idx").on(table.branchId)]
)

export const branchDomainRelations = relations(branchDomain, ({ one }) => ({
  branch: one(branch, {
    fields: [branchDomain.branchId],
    references: [branch.id],
  }),
}))

// ---------- Opening hours ----------

export const openingHours = pgTable(
  "opening_hours",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(),
    openTime: text("open_time"),
    closeTime: text("close_time"),
    isClosed: boolean("is_closed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("opening_hours_branch_day_idx").on(
      table.branchId,
      table.dayOfWeek
    ),
    check(
      "opening_hours_closed_times_check",
      sql`(${table.isClosed} = true AND ${table.openTime} IS NULL AND ${table.closeTime} IS NULL) OR (${table.isClosed} = false AND ${table.openTime} IS NOT NULL AND ${table.closeTime} IS NOT NULL)`
    ),
  ]
)

// ---------- Price row ----------

export const priceRow = pgTable(
  "price_row",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    weekdayAmountCents: integer("weekday_amount_cents").notNull(),
    weekendAmountCents: integer("weekend_amount_cents").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    check(
      "price_row_kind_check",
      sql`${table.kind} IN ('hourly','adult','child','shoe')`
    ),
    index("price_row_branch_idx").on(table.branchId, table.sortOrder),
  ]
)

export const priceRowTranslation = pgTable(
  "price_row_translation",
  {
    priceRowId: text("price_row_id")
      .notNull()
      .references(() => priceRow.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    label: text("label"),
    aiGenerated: boolean("ai_generated").default(false).notNull(),
    aiGeneratedAt: timestamp("ai_generated_at"),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    primaryKey({ columns: [table.priceRowId, table.locale] }),
    index("price_row_translation_locale_idx").on(table.locale),
  ]
)

// ---------- Offering package ----------

export const offeringPackage = pgTable(
  "offering_package",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("offering_package_branch_idx").on(table.branchId, table.sortOrder),
  ]
)

export const offeringPackageTranslation = pgTable(
  "offering_package_translation",
  {
    packageId: text("package_id")
      .notNull()
      .references(() => offeringPackage.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title"),
    perks: text("perks"),
    aiGenerated: boolean("ai_generated").default(false).notNull(),
    aiGeneratedAt: timestamp("ai_generated_at"),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    primaryKey({ columns: [table.packageId, table.locale] }),
    index("offering_package_translation_locale_idx").on(table.locale),
  ]
)

// ---------- Event offering ----------

export const eventOffering = pgTable(
  "event_offering",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    imageId: text("image_id").references((): AnyPgColumn => mediaAsset.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("event_offering_branch_idx").on(table.branchId, table.sortOrder),
  ]
)

export const eventOfferingTranslation = pgTable(
  "event_offering_translation",
  {
    eventOfferingId: text("event_offering_id")
      .notNull()
      .references(() => eventOffering.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title"),
    description: text("description"),
    aiGenerated: boolean("ai_generated").default(false).notNull(),
    aiGeneratedAt: timestamp("ai_generated_at"),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    primaryKey({ columns: [table.eventOfferingId, table.locale] }),
    index("event_offering_translation_locale_idx").on(table.locale),
  ]
)

// ---------- Menu ----------

export const menuCategory = pgTable(
  "menu_category",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("menu_category_branch_idx").on(table.branchId, table.sortOrder),
  ]
)

export const menuCategoryTranslation = pgTable(
  "menu_category_translation",
  {
    menuCategoryId: text("menu_category_id")
      .notNull()
      .references(() => menuCategory.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title"),
    aiGenerated: boolean("ai_generated").default(false).notNull(),
    aiGeneratedAt: timestamp("ai_generated_at"),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    primaryKey({ columns: [table.menuCategoryId, table.locale] }),
    index("menu_category_translation_locale_idx").on(table.locale),
  ]
)

export const menuItem = pgTable(
  "menu_item",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => menuCategory.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("menu_item_category_idx").on(table.categoryId, table.sortOrder),
  ]
)

export const menuItemTranslation = pgTable(
  "menu_item_translation",
  {
    menuItemId: text("menu_item_id")
      .notNull()
      .references(() => menuItem.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name"),
    tag: text("tag"),
    aiGenerated: boolean("ai_generated").default(false).notNull(),
    aiGeneratedAt: timestamp("ai_generated_at"),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    primaryKey({ columns: [table.menuItemId, table.locale] }),
    index("menu_item_translation_locale_idx").on(table.locale),
  ]
)

// ---------- Relations ----------

export const branchRelations = relations(branch, ({ one, many }) => ({
  heroImage: one(mediaAsset, {
    fields: [branch.heroImageId],
    references: [mediaAsset.id],
  }),
  translations: many(branchTranslation),
  domains: many(branchDomain),
  hours: many(openingHours),
  priceRows: many(priceRow),
  packages: many(offeringPackage),
  events: many(eventOffering),
  menuCategories: many(menuCategory),
}))

export const branchTranslationRelations = relations(
  branchTranslation,
  ({ one }) => ({
    branch: one(branch, {
      fields: [branchTranslation.branchId],
      references: [branch.id],
    }),
  })
)

export const openingHoursRelations = relations(openingHours, ({ one }) => ({
  branch: one(branch, {
    fields: [openingHours.branchId],
    references: [branch.id],
  }),
}))

export const priceRowRelations = relations(priceRow, ({ one, many }) => ({
  branch: one(branch, {
    fields: [priceRow.branchId],
    references: [branch.id],
  }),
  translations: many(priceRowTranslation),
}))

export const priceRowTranslationRelations = relations(
  priceRowTranslation,
  ({ one }) => ({
    priceRow: one(priceRow, {
      fields: [priceRowTranslation.priceRowId],
      references: [priceRow.id],
    }),
  })
)

export const offeringPackageRelations = relations(
  offeringPackage,
  ({ one, many }) => ({
    branch: one(branch, {
      fields: [offeringPackage.branchId],
      references: [branch.id],
    }),
    translations: many(offeringPackageTranslation),
  })
)

export const offeringPackageTranslationRelations = relations(
  offeringPackageTranslation,
  ({ one }) => ({
    package: one(offeringPackage, {
      fields: [offeringPackageTranslation.packageId],
      references: [offeringPackage.id],
    }),
  })
)

export const eventOfferingRelations = relations(
  eventOffering,
  ({ one, many }) => ({
    branch: one(branch, {
      fields: [eventOffering.branchId],
      references: [branch.id],
    }),
    image: one(mediaAsset, {
      fields: [eventOffering.imageId],
      references: [mediaAsset.id],
    }),
    translations: many(eventOfferingTranslation),
  })
)

export const eventOfferingTranslationRelations = relations(
  eventOfferingTranslation,
  ({ one }) => ({
    event: one(eventOffering, {
      fields: [eventOfferingTranslation.eventOfferingId],
      references: [eventOffering.id],
    }),
  })
)

export const menuCategoryRelations = relations(
  menuCategory,
  ({ one, many }) => ({
    branch: one(branch, {
      fields: [menuCategory.branchId],
      references: [branch.id],
    }),
    translations: many(menuCategoryTranslation),
    items: many(menuItem),
  })
)

export const menuCategoryTranslationRelations = relations(
  menuCategoryTranslation,
  ({ one }) => ({
    category: one(menuCategory, {
      fields: [menuCategoryTranslation.menuCategoryId],
      references: [menuCategory.id],
    }),
  })
)

export const menuItemRelations = relations(menuItem, ({ one, many }) => ({
  category: one(menuCategory, {
    fields: [menuItem.categoryId],
    references: [menuCategory.id],
  }),
  translations: many(menuItemTranslation),
}))

export const menuItemTranslationRelations = relations(
  menuItemTranslation,
  ({ one }) => ({
    menuItem: one(menuItem, {
      fields: [menuItemTranslation.menuItemId],
      references: [menuItem.id],
    }),
  })
)

// ---------- Footer link ----------

export const footerLink = pgTable(
  "footer_link",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    groupKey: text("group_key").notNull(),
    label: text("label").notNull(),
    href: text("href").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("footer_link_branch_locale_group_idx").on(
      table.branchId,
      table.locale,
      table.groupKey,
      table.sortOrder
    ),
  ]
)

// ---------- Google reviews ----------

export const reviewCache = pgTable("review_cache", {
  branchId: text("branch_id")
    .primaryKey()
    .references(() => branch.id, { onDelete: "cascade" }),
  placeName: text("place_name"),
  totalRatingCount: integer("total_rating_count"),
  averageRating: real("average_rating"),
  payload: jsonb("payload"),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const review = pgTable(
  "review",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    googleReviewId: text("google_review_id").notNull(),
    authorName: text("author_name").notNull(),
    authorAvatarUrl: text("author_avatar_url"),
    rating: integer("rating").notNull(),
    publishedAt: timestamp("published_at").notNull(),
    originalLocale: text("original_locale"),
    textOriginal: text("text_original"),
    textHe: text("text_he"),
    textEn: text("text_en"),
    textRu: text("text_ru"),
    textAr: text("text_ar"),
    aiTranslated: boolean("ai_translated").default(false).notNull(),
    aiTranslatedAt: timestamp("ai_translated_at"),
    syncedAt: timestamp("synced_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("review_branch_google_idx").on(
      table.branchId,
      table.googleReviewId
    ),
    index("review_branch_published_idx").on(table.branchId, table.publishedAt),
    check("review_rating_check", sql`${table.rating} BETWEEN 1 AND 5`),
  ]
)

export const reviewCacheRelations = relations(reviewCache, ({ one }) => ({
  branch: one(branch, {
    fields: [reviewCache.branchId],
    references: [branch.id],
  }),
}))

export const reviewRelations = relations(review, ({ one }) => ({
  branch: one(branch, {
    fields: [review.branchId],
    references: [branch.id],
  }),
}))

// ---------- Legal page ----------

export const legalPage = pgTable(
  "legal_page",
  {
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    titleHe: text("title_he"),
    titleEn: text("title_en"),
    titleRu: text("title_ru"),
    titleAr: text("title_ar"),
    bodyMarkdownHe: text("body_markdown_he"),
    bodyMarkdownEn: text("body_markdown_en"),
    bodyMarkdownRu: text("body_markdown_ru"),
    bodyMarkdownAr: text("body_markdown_ar"),
    published: boolean("published").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.branchId, table.slug] }),
    index("legal_page_branch_sort_idx").on(table.branchId, table.sortOrder),
  ]
)
