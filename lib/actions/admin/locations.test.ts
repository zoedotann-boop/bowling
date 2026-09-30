import { beforeEach, describe, expect, test } from "bun:test"
import { asc } from "drizzle-orm"

import { location } from "@/lib/db/schema"
import { db, resetLocations, text } from "@/lib/db/testing/admin-actions"

const { saveLocations } = await import("./locations")

const load = () =>
  db.query.location.findMany({ orderBy: [asc(location.sortOrder)] })

beforeEach(async () => {
  await resetLocations("rishon")
})

describe("saveLocations", () => {
  test("keeps the slug of an existing branch", async () => {
    const [rishon] = await load()

    const result = await saveLocations({
      locations: [
        { id: rishon.id, slug: "renamed", name: text("ר"), isVisible: false },
      ],
    })

    expect(result).toEqual({ ok: true })
    expect(await load()).toMatchObject([
      { id: rishon.id, slug: "rishon", name: text("ר"), isVisible: false },
    ])
  })

  test("saves the branch order", async () => {
    const [rishon] = await load()
    await saveLocations({
      locations: [
        { slug: "ramat-gan", name: text("רמת גן"), isVisible: true },
        { id: rishon.id, slug: "rishon", name: text("ראשון"), isVisible: true },
      ],
    })

    expect((await load()).map((row) => row.slug)).toEqual([
      "ramat-gan",
      "rishon",
    ])
  })

  test("rejects a branch the website doesn't serve", async () => {
    const result = await saveLocations({
      locations: [{ slug: "haifa", name: text("חיפה"), isVisible: true }],
    })

    expect(result).toEqual({ ok: false, error: "unknown-branch" })
    expect(await load()).toHaveLength(1)
  })
})
