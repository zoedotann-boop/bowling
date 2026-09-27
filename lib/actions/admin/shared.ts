import { z } from "zod"

export type ActionResult = { ok: true } | { ok: false; error: string }

export const OK: ActionResult = { ok: true }

export function readSlug(input: unknown): string {
  if (
    typeof input === "object" &&
    input !== null &&
    "slug" in input &&
    typeof (input as { slug: unknown }).slug === "string"
  ) {
    return (input as { slug: string }).slug
  }
  return ""
}

export const localizedSchema = z.object({
  he: z.string(),
  en: z.string().optional(),
})

export const rowIdSchema = z.uuid().optional()

export interface SyncCollectionArgs<T extends { id?: string }> {
  existingIds: string[]
  incoming: T[]
  insert: (row: T) => Promise<void>
  update: (id: string, row: T) => Promise<void>
  remove: (id: string) => Promise<void>
}

export async function syncCollection<T extends { id?: string }>({
  existingIds,
  incoming,
  insert,
  update,
  remove,
}: SyncCollectionArgs<T>): Promise<void> {
  const incomingIds = new Set(
    incoming.map((row) => row.id).filter((id): id is string => Boolean(id))
  )

  for (const id of existingIds) {
    if (!incomingIds.has(id)) await remove(id)
  }

  for (const row of incoming) {
    if (row.id) await update(row.id, row)
    else await insert(row)
  }
}
