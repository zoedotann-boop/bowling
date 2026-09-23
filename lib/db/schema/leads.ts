import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { eventType } from "./events"
import { location } from "./locations"

// A submission from a public event booking form. Dynamic answers live in
// `formData` (keyed by field key); the common contact fields and computed
// totals are denormalized so the admin leads list stays readable.
export const lead = pgTable("lead", {
  id: uuid("id").primaryKey().defaultRandom(),
  locationId: uuid("location_id").references(() => location.id, {
    onDelete: "set null",
  }),
  eventTypeId: uuid("event_type_id").references(() => eventType.id, {
    onDelete: "set null",
  }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  formData: jsonb("form_data").$type<Record<string, unknown>>(),
  selectedUpgrades: jsonb("selected_upgrades").$type<string[]>(),
  totalAmount: integer("total_amount"),
  signatureUrl: text("signature_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
