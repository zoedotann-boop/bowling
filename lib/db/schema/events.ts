import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core"

import { FORM_FIELD_TYPES, type FormFieldOption } from "@/lib/events/fields"

import { localized, timestamps } from "./_shared"
import { location } from "./locations"

// Field kinds the dynamic event-form engine can render. Compiled to a JSON
// Schema + UiSchema at request time.
export const formFieldType = pgEnum("form_field_type", FORM_FIELD_TYPES)

// An event type (birthday, corporate, league, …). This is the multi-event-type
// root: every per-event collection hangs off `eventTypeId`, so a manager can
// spin up a new event type and configure its package, steps, upgrades and form
// fields with no developer involvement.
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

// Fixed parameters for one event type (one row per event type).
export const eventTypeContent = pgTable("event_type_content", {
  eventTypeId: uuid("event_type_id")
    .primaryKey()
    .references(() => eventType.id, { onDelete: "cascade" }),
  heroTitle: localized(),
  heroDescription: localized(),
  // All money values are whole shekels (integer).
  packageAmount: integer("package_amount"),
  packageChildrenCount: integer("package_children_count"),
  extraChildAmount: integer("extra_child_amount"),
  depositAmount: integer("deposit_amount"),
  formIntro: localized(),
  formTerms: localized(),
  requiresSignature: boolean("requires_signature").notNull().default(false),
  ...timestamps,
})

// "How it works" steps.
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

// "What's included" package lines.
export const eventPackageLine = pgTable("event_package_line", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventTypeId: uuid("event_type_id")
    .notNull()
    .references(() => eventType.id, { onDelete: "cascade" }),
  label: localized().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
})

// Optional paid upgrades.
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

// Manager-defined dynamic form fields for the event's booking form.
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
