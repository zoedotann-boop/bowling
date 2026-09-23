import { defineConfig } from "drizzle-kit"

// Run via `bun run db:generate` / `db:migrate`; bun loads .env automatically.
export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  casing: "snake_case",
})
