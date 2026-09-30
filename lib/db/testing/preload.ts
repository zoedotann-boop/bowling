import { mock } from "bun:test"

import { createTestDb } from "./pglite"

export const testDb = await createTestDb()

mock.module("server-only", () => ({}))
mock.module("@/lib/db", () => ({ db: testDb }))
