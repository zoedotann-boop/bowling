import "server-only"

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as relations from "./relations"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

// Reuse a single postgres client across hot-reloads in development to avoid
// exhausting connections. postgres-js connects lazily on first query.
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
