import "server-only"

import { and, getTableColumns, notInArray, sql, type SQL } from "drizzle-orm"
import { toSnakeCase } from "drizzle-orm/casing"
import type { PgColumn, PgTable } from "drizzle-orm/pg-core"

import type { db } from "@/lib/db"

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

export function withIds<T extends { id?: string }>(
  rows: T[],
  ownedIds?: ReadonlySet<string>
): (T & { id: string; sortOrder: number })[] {
  return rows.map((row, sortOrder) => ({
    ...row,
    id:
      row.id && (!ownedIds || ownedIds.has(row.id))
        ? row.id
        : crypto.randomUUID(),
    sortOrder,
  }))
}

export async function ownedIds(
  tx: Tx,
  table: PgTable & { id: PgColumn },
  scope: SQL
): Promise<Set<string>> {
  const rows = await tx.select({ id: table.id }).from(table).where(scope)
  return new Set(rows.map((row) => String(row.id)))
}

function excludedSet(table: PgTable, keys: string[]): Record<string, SQL> {
  const columns: Record<string, PgColumn> = getTableColumns(table)
  const set: Record<string, SQL> = {}
  for (const key of [...keys, "updatedAt"]) {
    const column = columns[key]
    if (!column || column.primary) continue
    const name = column.keyAsName ? toSnakeCase(column.name) : column.name
    set[key] = key === "updatedAt" ? sql`now()` : sql.raw(`excluded."${name}"`)
  }
  return set
}

export async function upsert<T extends PgTable>(
  tx: Tx,
  table: T,
  target: PgColumn,
  rows: T["$inferInsert"][]
): Promise<void> {
  if (rows.length === 0) return
  await tx
    .insert(table)
    .values(rows)
    .onConflictDoUpdate({
      target,
      set: excludedSet(table, Object.keys(rows[0])),
    })
}

export async function syncRows<T extends PgTable & { id: PgColumn }>(
  tx: Tx,
  table: T,
  scope: SQL,
  rows: (T["$inferInsert"] & { id: string })[]
): Promise<void> {
  const ids = rows.map((row) => row.id)
  await tx
    .delete(table)
    .where(ids.length ? and(scope, notInArray(table.id, ids)) : scope)
  if (rows.length === 0) return

  await tx
    .insert(table)
    .values(rows)
    .onConflictDoUpdate({
      target: table.id,
      set: excludedSet(table, Object.keys(rows[0])),
      setWhere: scope,
    })
}
