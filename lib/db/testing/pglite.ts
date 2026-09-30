import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"

import * as relations from "@/lib/db/relations"
import * as schema from "@/lib/db/schema"

export async function createTestDb() {
  const client = new PGlite()
  const db = drizzle(client, {
    schema: { ...schema, ...relations },
    casing: "snake_case",
  })
  await migrate(db, { migrationsFolder: "lib/db/migrations" })
  return db
}
