import { beforeEach, describe, expect, test } from "bun:test"
import { asc, eq } from "drizzle-orm"

import { eventStep, eventType, location } from "@/lib/db/schema"
import {
  access,
  addLocation,
  db,
  resetLocations,
  text,
} from "@/lib/db/testing/admin-actions"

import type { EventsDraft, EventTypeDraft } from "./schemas"

const { saveEvents } = await import("./events")

function eventTypeDraft(
  slug: string,
  patch: Partial<EventTypeDraft> = {}
): EventTypeDraft {
  return {
    slug,
    name: text(slug),
    isVisible: true,
    content: {
      heroTitle: text(`${slug} title`),
      heroDescription: text(""),
      packageAmount: null,
      packageChildrenCount: null,
      extraChildAmount: null,
      depositAmount: null,
      scheduleTitle: text(""),
      allowedItems: [],
      forbiddenItems: [],
      rulesNote: text(""),
      policyItems: [],
      policyNote: text(""),
      formIntro: text(""),
      formTerms: text(""),
      formFootnote: text(""),
      requiresSignature: false,
    },
    steps: [],
    packageLines: [],
    upgrades: [],
    formFields: [],
    ...patch,
  }
}

async function load(locationId: string) {
  return db.query.eventType.findMany({
    where: eq(eventType.locationId, locationId),
    orderBy: [asc(eventType.sortOrder)],
    with: {
      content: true,
      steps: { orderBy: [asc(eventStep.sortOrder)] },
      packageLines: true,
      upgrades: true,
      formFields: true,
    },
  })
}

async function save(draft: Omit<EventsDraft, "slug">) {
  return saveEvents({ slug: access.location.slug, ...draft })
}

beforeEach(async () => {
  await resetLocations()
})

describe("saveEvents", () => {
  test("creates event types with their content and child rows", async () => {
    const result = await save({
      eventTypes: [
        eventTypeDraft("corporate", {
          steps: [
            { title: text("שלב 1"), description: text("") },
            { title: text("בדיקה"), description: text("תיאור") },
          ],
          packageLines: [{ label: text("בופה") }],
          upgrades: [{ label: text("בלונים"), amount: 100 }],
        }),
        eventTypeDraft("birthdays"),
      ],
    })

    expect(result).toEqual({ ok: true })
    const types = await load(access.location.id)
    expect(types.map((type) => [type.slug, type.sortOrder])).toEqual([
      ["corporate", 0],
      ["birthdays", 1],
    ])
    const [corporate] = types
    expect(corporate.content?.heroTitle).toEqual(text("corporate title"))
    expect(corporate.steps.map((step) => step.title.he)).toEqual([
      "שלב 1",
      "בדיקה",
    ])
    expect(corporate.packageLines).toHaveLength(1)
    expect(corporate.upgrades[0]).toMatchObject({ amount: 100 })
  })

  test("updates, reorders, adds and removes rows on a later save", async () => {
    await save({
      eventTypes: [
        eventTypeDraft("corporate", {
          steps: [
            { title: text("a"), description: text("") },
            { title: text("b"), description: text("") },
            { title: text("c"), description: text("") },
          ],
        }),
        eventTypeDraft("team"),
      ],
    })
    const [corporate] = await load(access.location.id)
    const [a, , c] = corporate.steps

    await save({
      eventTypes: [
        eventTypeDraft("corporate", {
          id: corporate.id,
          name: text("אירועי חברה"),
          steps: [
            { id: c.id, title: text("c"), description: text("") },
            { id: a.id, title: text("a edited"), description: text("") },
            { title: text("new"), description: text("") },
          ],
        }),
      ],
    })

    const types = await load(access.location.id)
    expect(types.map((type) => type.slug)).toEqual(["corporate"])
    expect(types[0].name).toEqual(text("אירועי חברה"))
    expect(types[0].steps.map((step) => step.title.he)).toEqual([
      "c",
      "a edited",
      "new",
    ])
    expect(types[0].steps[0].id).toBe(c.id)
  })

  test("removing every row of a list clears it", async () => {
    await save({
      eventTypes: [
        eventTypeDraft("birthdays", {
          upgrades: [{ label: text("בלונים"), amount: 100 }],
        }),
      ],
    })
    const [birthdays] = await load(access.location.id)

    await save({
      eventTypes: [eventTypeDraft("birthdays", { id: birthdays.id })],
    })

    expect((await load(access.location.id))[0].upgrades).toEqual([])
  })

  test("does not touch another location's rows", async () => {
    const other = await addLocation("ramat-gan")
    access.location = other
    await save({
      eventTypes: [
        eventTypeDraft("team", {
          steps: [{ title: text("keep"), description: text("") }],
        }),
      ],
    })
    const [foreign] = await load(other.id)

    access.location = await db.query.location
      .findFirst({ where: eq(location.slug, "rishon") })
      .then((row) => ({ id: row!.id, slug: row!.slug }))
    await save({
      eventTypes: [
        eventTypeDraft("team", {
          id: foreign.id,
          name: text("hijacked"),
          steps: [
            {
              id: foreign.steps[0].id,
              title: text("x"),
              description: text(""),
            },
          ],
        }),
      ],
    })

    const [untouched] = await load(other.id)
    expect(untouched.name).toEqual(text("team"))
    expect(untouched.content?.heroTitle).toEqual(text("team title"))
    expect(untouched.steps[0].title).toEqual(text("keep"))
  })

  test("rejects duplicate slugs without writing", async () => {
    const result = await save({
      eventTypes: [eventTypeDraft("team"), eventTypeDraft("team")],
    })

    expect(result).toEqual({ ok: false, error: "slug-taken" })
    expect(await load(access.location.id)).toEqual([])
  })

  test("rolls back every write when a statement fails", async () => {
    await save({ eventTypes: [eventTypeDraft("team")] })
    const before = await load(access.location.id)
    const duplicateId = crypto.randomUUID()

    const result = await save({
      eventTypes: [
        eventTypeDraft("team", {
          id: before[0].id,
          name: text("renamed"),
          steps: [
            { id: duplicateId, title: text("a"), description: text("") },
            { id: duplicateId, title: text("b"), description: text("") },
          ],
        }),
      ],
    }).catch(() => ({ ok: false }))

    expect(result.ok).toBe(false)
    expect((await load(access.location.id))[0].name).toEqual(text("team"))
  })
})
