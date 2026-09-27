import { defineConfig } from "drizzle-kit"

function migrationUrl() {
  const unpooled = process.env.DATABASE_URL_UNPOOLED
  if (!unpooled) return process.env.DATABASE_URL ?? ""
  const url = new URL(unpooled)
  url.searchParams.set("options", "-c client_min_messages=warning")
  return url.toString()
}

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl(),
  },
  casing: "snake_case",
})
