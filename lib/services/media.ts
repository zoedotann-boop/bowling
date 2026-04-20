import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { mediaAsset } from "@/lib/db/schema/media"

import { formatZodErrors } from "./errors"
import { createMediaAssetSchema } from "./schemas"
import type { WriteResult } from "./types"

export type MediaAssetRead = {
  id: string
  blobUrl: string
  filename: string | null
  contentType: string | null
  width: number | null
  height: number | null
  sizeBytes: number | null
}

function toRead(row: typeof mediaAsset.$inferSelect): MediaAssetRead {
  return {
    id: row.id,
    blobUrl: row.blobUrl,
    filename: row.filename,
    contentType: row.contentType,
    width: row.width,
    height: row.height,
    sizeBytes: row.sizeBytes,
  }
}

export async function getById(id: string): Promise<MediaAssetRead | null> {
  const [row] = await db
    .select()
    .from(mediaAsset)
    .where(eq(mediaAsset.id, id))
    .limit(1)
  return row ? toRead(row) : null
}

export async function create(
  input: unknown
): Promise<WriteResult<MediaAssetRead>> {
  const parsed = createMediaAssetSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const id = crypto.randomUUID()
  const [row] = await db
    .insert(mediaAsset)
    .values({
      id,
      blobUrl: parsed.data.blobUrl,
      filename: parsed.data.filename ?? null,
      contentType: parsed.data.contentType ?? null,
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null,
      sizeBytes: parsed.data.sizeBytes ?? null,
    })
    .returning()
  return { ok: true, data: toRead(row!), revalidateTags: [] }
}
