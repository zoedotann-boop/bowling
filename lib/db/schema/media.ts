import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const mediaAsset = pgTable("media_asset", {
  id: text("id").primaryKey(),
  blobUrl: text("blob_url").notNull(),
  filename: text("filename"),
  contentType: text("content_type"),
  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})
