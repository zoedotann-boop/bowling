#!/usr/bin/env bun
import { put } from "@vercel/blob"
import { eq, isNull, not, or } from "drizzle-orm"

import { db } from "@/lib/db"
import { mediaAsset } from "@/lib/db/schema/media"

function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com")
  } catch {
    return false
  }
}

function inferContentType(url: string, fallback: string | null): string {
  if (fallback) return fallback
  const lower = url.toLowerCase()
  if (lower.includes(".png")) return "image/png"
  if (lower.includes(".webp")) return "image/webp"
  if (lower.includes(".avif")) return "image/avif"
  return "image/jpeg"
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("[migrate-hero-images] DATABASE_URL is required")
    process.exit(1)
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[migrate-hero-images] BLOB_READ_WRITE_TOKEN is required")
    process.exit(1)
  }

  const rows = await db
    .select()
    .from(mediaAsset)
    .where(or(isNull(mediaAsset.blobUrl), not(isNull(mediaAsset.blobUrl))))

  let migrated = 0
  let skipped = 0
  for (const row of rows) {
    if (isBlobUrl(row.blobUrl)) {
      skipped++
      continue
    }

    console.log(`[migrate-hero-images] ${row.id}: fetching ${row.blobUrl}`)
    const response = await fetch(row.blobUrl)
    if (!response.ok) {
      console.error(
        `[migrate-hero-images] ${row.id}: fetch failed (${response.status})`
      )
      continue
    }
    const blob = await response.blob()
    const contentType = inferContentType(row.blobUrl, row.contentType)
    const name = row.filename ?? `${row.id}.jpg`
    const safe = name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "")
    const uploaded = await put(`media/${safe}`, blob, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    })

    await db
      .update(mediaAsset)
      .set({
        blobUrl: uploaded.url,
        contentType,
        sizeBytes: blob.size,
      })
      .where(eq(mediaAsset.id, row.id))
    migrated++
    console.log(`[migrate-hero-images] ${row.id}: → ${uploaded.url}`)
  }

  console.log(
    `[migrate-hero-images] done — migrated: ${migrated}, skipped: ${skipped}`
  )
  process.exit(0)
}

main().catch((err) => {
  console.error("[migrate-hero-images] FAILED:", err)
  process.exit(1)
})
