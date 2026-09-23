import { randomUUID } from "node:crypto"

import { hashPassword } from "better-auth/crypto"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "@/lib/db/schema"

// One-off seed: creates the owner login and the two branches so the admin is
// usable after `bun run db:migrate`. Run with `bun run db:seed`. Override the
// owner credentials with SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
//
// This builds its own database client (rather than importing lib/db) so it can
// run outside the Next.js server runtime.
async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")

  const client = postgres(url, { prepare: false })
  const db = drizzle(client, { schema, casing: "snake_case" })

  const email = process.env.SEED_ADMIN_EMAIL ?? "owner@example.com"
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123"

  const userId = randomUUID()
  await db
    .insert(schema.user)
    .values({
      id: userId,
      name: "Owner",
      email,
      emailVerified: true,
      role: "owner",
    })
    .onConflictDoNothing()

  await db
    .insert(schema.account)
    .values({
      id: randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: await hashPassword(password),
    })
    .onConflictDoNothing()

  await db
    .insert(schema.location)
    .values([
      {
        slug: "ramat-gan",
        name: { he: "סניף רמת גן", en: "Ramat Gan" },
        addressLine1: { he: "" },
        addressFull: { he: "" },
        sortOrder: 0,
      },
      {
        slug: "rishon",
        name: { he: "סניף ראשון לציון", en: "Rishon LeZion" },
        addressLine1: { he: "" },
        addressFull: { he: "" },
        sortOrder: 1,
      },
    ])
    .onConflictDoNothing()

  await client.end()
  console.log(`Seeded owner <${email}> and 2 locations.`)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
