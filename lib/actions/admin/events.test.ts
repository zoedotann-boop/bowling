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
      heroImageUrl: "",
      badges: [],
      depositAmount: null,
      scheduleTitle: text(""),
      priceNote: text(""),
      priceOptions: [],
      priceSummaryMode: "auto",
      priceSummaryRows: [],
      allowedItems: [],
      forbiddenItems: [],
      rulesNote: text(""),
      policyItems: [],
      policyNote: text(""),
      formIntro: text(""),
      formTerms: text(""),
      formFootnote: text(""),
      upgradesTitle: text(""),
      upgradesNote: text(""),
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

  test("stores the hero badges in order and keeps an emptied list empty", async () => {
    const draft = eventTypeDraft("birthdays")
    const badges = [text("מגיל 8+"), text("מינימום 20 ילדים")]
    await save({
      eventTypes: [{ ...draft, content: { ...draft.content, badges } }],
    })
    const [saved] = await load(access.location.id)
    expect(saved.content?.badges).toEqual(badges)

    await save({
      eventTypes: [{ ...draft, id: saved.id }],
    })
    const [cleared] = await load(access.location.id)
    expect(cleared.content?.badges).toEqual([])
  })

  test("stores a time field's times in order through the evening", async () => {
    const time = (value: string) => ({ value, label: text(value) })
    const result = await save({
      eventTypes: [
        eventTypeDraft("birthdays", {
          formFields: [
            {
              key: "field_eventtime",
              label: text("שעת האירוע"),
              placeholder: text("בחרו שעה"),
              type: "time",
              options: [
                time("00:30"),
                time("18:00"),
                time(""),
                time("10:00"),
                time("18:00"),
              ],
              minValue: null,
              maxValue: null,
              isRequired: true,
              isVisible: true,
            },
          ],
        }),
      ],
    })

    expect(result).toEqual({ ok: true })
    const [birthdays] = await load(access.location.id)
    const [field] = birthdays.formFields
    expect(field.type).toBe("time")
    expect(field.options?.map((option) => option.value)).toEqual([
      "10:00",
      "18:00",
      "00:30",
    ])
    expect(field.options?.[0].label).toEqual({ he: "10:00", en: "10:00" })
  })

  test("stores the upgrades box title and explanation", async () => {
    const draft = eventTypeDraft("birthdays")
    await save({
      eventTypes: [
        {
          ...draft,
          content: {
            ...draft.content,
            upgradesTitle: text("רוצים להוסיף?"),
            upgradesNote: text("הפקידה תחזור אליכם"),
          },
          upgrades: [{ label: text("בלונים"), amount: 100 }],
        },
      ],
    })
    const [birthdays] = await load(access.location.id)
    expect(birthdays.content?.upgradesTitle).toEqual(text("רוצים להוסיף?"))
    expect(birthdays.content?.upgradesNote).toEqual(text("הפקידה תחזור אליכם"))
    expect(birthdays.upgrades.map((u) => u.label.he)).toEqual(["בלונים"])
  })

  test("stores several price options in order with the price note", async () => {
    const draft = eventTypeDraft("birthdays")
    const weekend = {
      label: text("סופ״ש / חול המועד"),
      days: text("שי׳–שב׳"),
      badge: text("סופ״ש וחגים"),
      amount: 1280,
      childrenCount: 20,
      extraChildAmount: 64,
    }
    const midweek = {
      label: text("אמצע שבוע"),
      days: text("א׳–ה׳"),
      badge: text(""),
      amount: 1180,
      childrenCount: 20,
      extraChildAmount: 59,
    }
    await save({
      eventTypes: [
        {
          ...draft,
          content: {
            ...draft.content,
            priceNote: text("מינימום 20 משתתפים"),
            priceOptions: [weekend, midweek],
            depositAmount: 200,
          },
        },
      ],
    })
    const [saved] = await load(access.location.id)
    expect(saved.content?.priceNote).toEqual(text("מינימום 20 משתתפים"))
    expect(saved.content?.priceOptions).toEqual([weekend, midweek])
    expect(saved.content?.depositAmount).toBe(200)

    await save({
      eventTypes: [
        {
          ...draft,
          id: saved.id,
          content: { ...draft.content, priceOptions: [midweek] },
        },
      ],
    })
    const [updated] = await load(access.location.id)
    expect(updated.content?.priceOptions).toEqual([midweek])
  })

  test("keeps an emptied price list empty so the section stays hidden", async () => {
    const draft = eventTypeDraft("birthdays")
    await save({ eventTypes: [draft] })
    const [saved] = await load(access.location.id)
    expect(saved.content?.priceOptions).toEqual([])
  })

  test("stores the price summary mode and hand-written rows", async () => {
    const draft = eventTypeDraft("birthdays")
    const rows = [
      { label: text("אמצע שבוע · 20 ילדים"), value: text("1,180 ₪") },
      { label: text("סופ״ש / חגים · 20 ילדים"), value: text("1,280 ₪") },
    ]
    await save({
      eventTypes: [
        {
          ...draft,
          content: {
            ...draft.content,
            priceSummaryMode: "manual",
            priceSummaryRows: rows,
          },
        },
      ],
    })
    const [saved] = await load(access.location.id)
    expect(saved.content?.priceSummaryMode).toBe("manual")
    expect(saved.content?.priceSummaryRows).toEqual(rows)

    await save({
      eventTypes: [
        {
          ...draft,
          id: saved.id,
          content: { ...draft.content, priceSummaryMode: "hidden" },
        },
      ],
    })
    const [hidden] = await load(access.location.id)
    expect(hidden.content?.priceSummaryMode).toBe("hidden")
  })

  test("rejects an unknown price summary mode", async () => {
    const draft = eventTypeDraft("birthdays")
    const result = await saveEvents({
      slug: access.location.slug,
      eventTypes: [
        {
          ...draft,
          content: { ...draft.content, priceSummaryMode: "sometimes" },
        },
      ],
    })
    expect(result).toEqual({ ok: false, error: "invalid" })
  })

  test("rejects a negative or fractional price", async () => {
    const draft = eventTypeDraft("birthdays")
    const option = {
      label: text("אמצע שבוע"),
      days: text(""),
      badge: text(""),
      amount: -5,
      childrenCount: null,
      extraChildAmount: null,
    }
    for (const bad of [option, { ...option, amount: 10.5 }]) {
      const result = await save({
        eventTypes: [
          { ...draft, content: { ...draft.content, priceOptions: [bad] } },
        ],
      })
      expect(result).toEqual({ ok: false, error: "invalid" })
    }
    expect(await load(access.location.id)).toHaveLength(0)
  })

  test("stores the hero image URL and clears it back to the default", async () => {
    const draft = eventTypeDraft("corporate")
    const imageUrl =
      "https://abc.public.blob.vercel-storage.com/admin/hero-x1.jpg"
    await save({
      eventTypes: [
        { ...draft, content: { ...draft.content, heroImageUrl: imageUrl } },
      ],
    })
    const [saved] = await load(access.location.id)
    expect(saved.content?.heroImageUrl).toBe(imageUrl)

    await save({ eventTypes: [{ ...draft, id: saved.id }] })
    const [cleared] = await load(access.location.id)
    expect(cleared.content?.heroImageUrl).toBeNull()
  })

  test("rejects an insecure hero image URL", async () => {
    const draft = eventTypeDraft("corporate")
    const result = await save({
      eventTypes: [
        {
          ...draft,
          content: {
            ...draft.content,
            heroImageUrl: "http://example.com/hero.jpg",
          },
        },
      ],
    })
    expect(result).toEqual({ ok: false, error: "invalid" })
    expect(await load(access.location.id)).toHaveLength(0)
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
