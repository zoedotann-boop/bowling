import { del } from "@vercel/blob"
import { and, desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { mediaAsset } from "@/lib/db/schema/media"

import { formatZodErrors } from "./errors"
import { createMediaAssetSchema, updateMediaAltTextSchema } from "./schemas"
import { tags } from "./tags"
import type { WriteResult } from "./types"

export type MediaAssetRead = {
  id: string
  branchId: string
  blobUrl: string
  filename: string | null
  contentType: string | null
  width: number | null
  height: number | null
  sizeBytes: number | null
  uploadedBy: string | null
  altTextHe: string | null
  altTextEn: string | null
  altTextRu: string | null
  altTextAr: string | null
  createdAt: Date
}

function toRead(row: typeof mediaAsset.$inferSelect): MediaAssetRead {
  return {
    id: row.id,
    branchId: row.branchId,
    blobUrl: row.blobUrl,
    filename: row.filename,
    contentType: row.contentType,
    width: row.width,
    height: row.height,
    sizeBytes: row.sizeBytes,
    uploadedBy: row.uploadedBy,
    altTextHe: row.altTextHe,
    altTextEn: row.altTextEn,
    altTextRu: row.altTextRu,
    altTextAr: row.altTextAr,
    createdAt: row.createdAt,
  }
}

export async function listByBranch(
  branchId: string,
  limit = 200
): Promise<MediaAssetRead[]> {
  const rows = await db
    .select()
    .from(mediaAsset)
    .where(eq(mediaAsset.branchId, branchId))
    .orderBy(desc(mediaAsset.createdAt))
    .limit(limit)
  return rows.map(toRead)
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
      branchId: parsed.data.branchId,
      blobUrl: parsed.data.blobUrl,
      filename: parsed.data.filename ?? null,
      contentType: parsed.data.contentType ?? null,
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null,
      sizeBytes: parsed.data.sizeBytes ?? null,
      uploadedBy: parsed.data.uploadedBy ?? null,
      altTextHe: parsed.data.altTextHe ?? null,
      altTextEn: parsed.data.altTextEn ?? null,
      altTextRu: parsed.data.altTextRu ?? null,
      altTextAr: parsed.data.altTextAr ?? null,
    })
    .returning()
  return {
    ok: true,
    data: toRead(row!),
    revalidateTags: [tags.mediaBranch(parsed.data.branchId)],
  }
}

export async function updateAltText(
  input: unknown
): Promise<WriteResult<MediaAssetRead>> {
  const parsed = updateMediaAltTextSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodErrors(parsed.error) }
  }
  const [row] = await db
    .update(mediaAsset)
    .set({
      altTextHe: parsed.data.altTextHe ?? null,
      altTextEn: parsed.data.altTextEn ?? null,
      altTextRu: parsed.data.altTextRu ?? null,
      altTextAr: parsed.data.altTextAr ?? null,
    })
    .where(eq(mediaAsset.id, parsed.data.id))
    .returning()
  if (!row) return { ok: false, fieldErrors: { id: ["media not found"] } }
  return {
    ok: true,
    data: toRead(row),
    revalidateTags: [tags.mediaBranch(row.branchId), tags.media(row.id)],
  }
}

export async function remove(
  id: string,
  branchId: string
): Promise<WriteResult<{ id: string }>> {
  const [row] = await db
    .select({
      id: mediaAsset.id,
      blobUrl: mediaAsset.blobUrl,
      branchId: mediaAsset.branchId,
    })
    .from(mediaAsset)
    .where(and(eq(mediaAsset.id, id), eq(mediaAsset.branchId, branchId)))
    .limit(1)
  if (!row) return { ok: false, fieldErrors: { id: ["media not found"] } }

  try {
    await del(row.blobUrl)
  } catch (error) {
    console.error("[media.remove] blob delete failed", {
      id,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  await db.delete(mediaAsset).where(eq(mediaAsset.id, id))
  return {
    ok: true,
    data: { id },
    revalidateTags: [tags.mediaBranch(row.branchId), tags.media(id)],
  }
}

export {
  ALLOWED_UPLOAD_MIME,
  MAX_UPLOAD_BYTES,
  validateUpload,
  type UploadValidationError,
} from "./media-validation"
