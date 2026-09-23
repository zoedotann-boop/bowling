import "server-only"

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as relations from "./relations"
import * as schema from "./schema"

// Don't throw when DATABASE_URL is unset: `next build` imports this module while
// collecting page data, so a throw here would break the build (e.g. on a host
// without the env var configured). postgres-js connects lazily, so a missing
// URL only surfaces as a connection error when a query actually runs.
const connectionString = process.env.DATABASE_URL ?? ""

// Reuse a single postgres client across hot-reloads in development to avoid
// exhausting connections.
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>
}

const client =
  globalForDb.client ?? postgres(connectionString, { prepare: false })

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client
}

export const db = drizzle(client, {
  schema: { ...schema, ...relations },
  // Must match drizzle.config.ts so runtime column names line up with the
  // snake_case columns the migrations created.
  casing: "snake_case",
})
