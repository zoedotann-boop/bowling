import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core"

import type { EventPolicyItem } from "@/lib/events/details"
import { FORM_FIELD_TYPES, type FormFieldOption } from "@/lib/events/fields"

import { localized, timestamps, type Localized } from "./_shared"
import { location } from "./locations"

export const formFieldType = pgEnum("form_field_type", FORM_FIELD_TYPES)

export const eventType = pgTable("event_type", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  name: localized().notNull(),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const eventTypeContent = pgTable("event_type_content", {
  eventTypeId: uuid("event_type_id")
    .primaryKey()
    .references(() => eventType.id, { onDelete: "cascade" }),
  heroTitle: localized(),
  heroDescription: localized(),
  heroImageUrl: text("hero_image_url"),
  packageAmount: integer("package_amount"),
  packageChildrenCount: integer("package_children_count"),
  extraChildAmount: integer("extra_child_amount"),
  depositAmount: integer("deposit_amount"),
  scheduleTitle: localized(),
  allowedItems: jsonb().$type<Localized[]>(),
  forbiddenItems: jsonb().$type<Localized[]>(),
  rulesNote: localized(),
  policyItems: jsonb().$type<EventPolicyItem[]>(),
  policyNote: localized(),
  formIntro: localized(),
  formTerms: localized(),
  formFootnote: localized(),
  requiresSignature: boolean("requires_signature").notNull().default(false),
  ...timestamps,
})

export const eventStep = pgTable("event_step", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventTypeId: uuid("event_type_id")
    .notNull()
    .references(() => eventType.id, { onDelete: "cascade" }),
  title: localized().notNull(),
  description: localized(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const eventPackageLine = pgTable("event_package_line", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventTypeId: uuid("event_type_id")
    .notNull()
    .references(() => eventType.id, { onDelete: "cascade" }),
  label: localized().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const eventUpgrade = pgTable("event_upgrade", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventTypeId: uuid("event_type_id")
    .notNull()
    .references(() => eventType.id, { onDelete: "cascade" }),
  label: localized().notNull(),
  amount: integer("amount"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

export const eventFormField = pgTable("event_form_field", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventTypeId: uuid("event_type_id")
    .notNull()
    .references(() => eventType.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  label: localized().notNull(),
  placeholder: localized(),
  type: formFieldType("type").notNull().default("text"),
  options: jsonb("options").$type<FormFieldOption[]>(),
  minValue: integer("min_value"),
  maxValue: integer("max_value"),
  isRequired: boolean("is_required").notNull().default(false),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})
