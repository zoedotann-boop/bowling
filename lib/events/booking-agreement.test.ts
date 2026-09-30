import { beforeEach, describe, expect, test } from "bun:test"

import { eventType, eventTypeContent } from "@/lib/db/schema"
import {
  addLocation,
  db,
  resetLocations,
  text,
} from "@/lib/db/testing/admin-actions"
import he from "@/messages/he.json"

import type { EventDetailTexts } from "./details"

const { loadAgreement, renderAgreement, SIGNATURE_CID } =
  await import("./booking-agreement")

async function addEvent(
  locationId: string,
  slug: string,
  content: Partial<typeof eventTypeContent.$inferInsert> = {},
  isVisible = true
) {
  const [row] = await db
    .insert(eventType)
    .values({ locationId, slug, name: text(slug), isVisible })
    .returning({ id: eventType.id })
  await db.insert(eventTypeContent).values({ eventTypeId: row.id, ...content })
}

const TEXTS: EventDetailTexts = {
  scheduleTitle: text(""),
  allowedItems: [text("עוגה"), text("  ")],
  forbiddenItems: [text("זיקוקים")],
  rulesNote: text("הערת כללים"),
  policyItems: [
    { title: text("ביטול"), description: text("עד 7 ימים") },
    { title: text(""), description: text("שורה בלי כותרת") },
  ],
  policyNote: text("הערת מדיניות"),
  formIntro: text(""),
  formTerms: text("אני מאשר <הכל>"),
  formFootnote: text(""),
  upgradesTitle: text(""),
  upgradesNote: text(""),
}

describe("renderAgreement", () => {
  test("lists the rules, the booking policy and the confirmed terms", () => {
    const html = renderAgreement(TEXTS, false)
    expect(html).toContain("כללים · מותר להביא")
    expect(html).toContain('<li style="margin:0 0 6px;">עוגה</li>')
    expect(html).toContain("כללים · אסור להביא")
    expect(html).toContain("זיקוקים")
    expect(html).toContain("הערת כללים")
    expect(html).toContain("תנאים · מדיניות הזמנה")
    expect(html).toContain("ביטול – עד 7 ימים")
    expect(html).toContain(">שורה בלי כותרת<")
    expect(html).toContain("הערת מדיניות")
    expect(html).toContain("הלקוח/ה אישר/ה: אני מאשר &lt;הכל&gt;")
  })

  test("skips blank rule items", () => {
    expect(renderAgreement(TEXTS, false).match(/<li /g)).toHaveLength(4)
  })

  test("shows the signature inline only when the customer signed", () => {
    expect(renderAgreement(TEXTS, true)).toContain(`src="cid:${SIGNATURE_CID}"`)
    expect(renderAgreement(TEXTS, false)).not.toContain("cid:")
  })

  test("leaves out empty sections but always keeps the confirmation", () => {
    const html = renderAgreement(
      {
        ...TEXTS,
        allowedItems: [],
        forbiddenItems: [],
        rulesNote: text(""),
        policyItems: [],
        policyNote: text(""),
      },
      false
    )
    expect(html).not.toContain("כללים")
    expect(html).not.toContain("מדיניות")
    expect(html).toContain("אישור וחתימה")
  })
})

describe("loadAgreement", () => {
  let locationId = ""

  beforeEach(async () => {
    locationId = (await resetLocations("rishon")).id
  })

  test("uses what the admin saved for this branch and event", async () => {
    await addEvent(locationId, "birthdays", {
      allowedItems: [text("בלונים")],
      formTerms: text("מאשר/ת"),
    })
    const texts = await loadAgreement("rishon", "birthdays")
    expect(texts.allowedItems).toEqual([text("בלונים")])
    expect(texts.formTerms).toEqual(text("מאשר/ת"))
  })

  test("ignores other branches and hidden events", async () => {
    const other = await addLocation("ramat-gan")
    await addEvent(other.id, "birthdays", { allowedItems: [text("אחר")] })
    await addEvent(
      other.id,
      "gymboree",
      { allowedItems: [text("מוסתר")] },
      false
    )
    const texts = await loadAgreement("rishon", "birthdays")
    expect(texts.allowedItems).not.toContainEqual(text("אחר"))
    const hidden = await loadAgreement("ramat-gan", "gymboree")
    expect(hidden.allowedItems).not.toContainEqual(text("מוסתר"))
  })

  test("falls back to the site's built-in texts when nothing is saved", async () => {
    const texts = await loadAgreement("rishon", "birthdays")
    expect(texts.policyItems.length).toBeGreaterThan(0)
    expect(texts.formTerms.he).toBe(he.eventDetails.form.termsConfirm)
  })

  test("uses the default terms when the saved terms are blank", async () => {
    await addEvent(locationId, "birthdays", { formTerms: text("  ") })
    const texts = await loadAgreement("rishon", "birthdays")
    expect(texts.formTerms.he).toBe(he.eventDetails.form.termsConfirm)
  })
})
