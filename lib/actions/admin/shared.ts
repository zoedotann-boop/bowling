import { z } from "zod"

// Actions return machine-readable codes, never sentences. The client maps codes
// to translated toasts (see components/admin/toast.tsx + admin.common.*).
export type ActionResult = { ok: true } | { ok: false; error: string }

export const OK: ActionResult = { ok: true }

// Reads the `slug` off unvalidated action input so the access gate can run
// first (full zod validation happens after authentication).
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

// Presence of the uuid marks an existing row; absence marks an insert.
export const rowIdSchema = z.uuid().optional()

export interface SyncCollectionArgs<T extends { id?: string }> {
  existingIds: string[]
  incoming: T[]
  insert: (row: T) => Promise<void>
  update: (id: string, row: T) => Promise<void>
  remove: (id: string) => Promise<void>
}

// The critical persistence primitive. Diffs an incoming array against the rows
// currently in the database:
//   • row with an id            → update
//   • row without an id         → insert
//   • existing id not incoming  → delete
// Callers inject `sortOrder` from array index before calling.
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
