import { relations } from "drizzle-orm"
import {
  type AnyPgColumn,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { user } from "./auth"
import { branch } from "./content"

export const mediaAsset = pgTable(
  "media_asset",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references((): AnyPgColumn => branch.id, { onDelete: "cascade" }),
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
  },
  (table) => [
    index("media_asset_branch_idx").on(table.branchId, table.createdAt),
  ]
)

export const mediaAssetRelations = relations(mediaAsset, ({ one }) => ({
  branch: one(branch, {
    fields: [mediaAsset.branchId],
    references: [branch.id],
  }),
  uploader: one(user, {
    fields: [mediaAsset.uploadedBy],
    references: [user.id],
  }),
}))
