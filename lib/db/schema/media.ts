import { relations } from "drizzle-orm"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { user } from "./auth"

export const mediaAsset = pgTable("media_asset", {
  id: text("id").primaryKey(),
  blobUrl: text("blob_url").notNull(),
  filename: text("filename"),
  contentType: text("content_type"),
  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes"),
  uploadedBy: text("uploaded_by").references(() => user.id, {
    onDelete: "set null",
  }),
  altTextHe: text("alt_text_he"),
  altTextEn: text("alt_text_en"),
  altTextRu: text("alt_text_ru"),
  altTextAr: text("alt_text_ar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const mediaAssetRelations = relations(mediaAsset, ({ one }) => ({
  uploader: one(user, {
    fields: [mediaAsset.uploadedBy],
    references: [user.id],
  }),
}))
