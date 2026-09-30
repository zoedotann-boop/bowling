import { describe, expect, test } from "bun:test"

import en from "@/messages/en.json"
import he from "@/messages/he.json"

import {
  defaultBookingFields,
  defaultFormFields,
  eventDetailDefaults,
} from "./detail-defaults"
import { withEventDetailDefaults, type EventDetailTexts } from "./details"

const DEFAULTS: EventDetailTexts = {
  scheduleTitle: { he: "מה הלו״ז?", en: "What's the schedule?" },
  allowedItems: [{ he: "עוגה", en: "Cake" }],
  forbiddenItems: [{ he: "זיקוקים", en: "Fireworks" }],
  rulesNote: { he: "הערת כללים", en: "Rules note" },
  policyItems: [
    {
      title: { he: "ביטול", en: "Cancelling" },
      description: { he: "עד 7 ימים", en: "Up to 7 days" },
    },
  ],
  policyNote: { he: "הערת מדיניות", en: "Policy note" },
  formIntro: { he: "פתיחה", en: "Intro" },
  formTerms: { he: "אני מאשר", en: "I agree" },
  formFootnote: { he: "הערת טופס", en: "Form note" },
  upgradesTitle: { he: "שדרוגים", en: "Upgrades" },
  upgradesNote: { he: "הפקידה תחזור אליכם", en: "The clerk will call" },
}

describe("withEventDetailDefaults", () => {
  test("uses every default when the event has no stored content", () => {
    expect(withEventDetailDefaults(null, DEFAULTS)).toEqual(DEFAULTS)
    expect(withEventDetailDefaults(undefined, DEFAULTS)).toEqual(DEFAULTS)
  })

  test("uses defaults for columns that were never saved (null)", () => {
    const stored = {
      allowedItems: null,
      rulesNote: null,
      formTerms: { he: "טקסט חדש" },
    }
    expect(withEventDetailDefaults(stored, DEFAULTS)).toEqual({
      ...DEFAULTS,
      formTerms: { he: "טקסט חדש" },
    })
  })

  test("stored values replace the defaults", () => {
    const stored: EventDetailTexts = {
      scheduleTitle: { he: "איך זה עובד?", en: "How it works" },
      allowedItems: [{ he: "בלונים", en: "Balloons" }],
      forbiddenItems: [{ he: "אלכוהול", en: "Alcohol" }],
      rulesNote: { he: "א", en: "a" },
      policyItems: [
        {
          title: { he: "תשלום", en: "Payment" },
          description: { he: "במקום", en: "On site" },
        },
      ],
      policyNote: { he: "ב", en: "b" },
      formIntro: { he: "ג", en: "c" },
      formTerms: { he: "ד", en: "d" },
      formFootnote: { he: "ה", en: "e" },
      upgradesTitle: { he: "ו", en: "f" },
      upgradesNote: { he: "ז", en: "g" },
    }
    expect(withEventDetailDefaults(stored, DEFAULTS)).toEqual(stored)
  })

  test("keeps an emptied list empty so the admin can hide a section", () => {
    const result = withEventDetailDefaults(
      { allowedItems: [], forbiddenItems: [], policyItems: [] },
      DEFAULTS
    )
    expect(result.allowedItems).toEqual([])
    expect(result.forbiddenItems).toEqual([])
    expect(result.policyItems).toEqual([])
  })

  test("keeps a cleared note blank so the admin can hide it", () => {
    const blank = { he: "", en: "" }
    const result = withEventDetailDefaults(
      { rulesNote: blank, policyNote: blank, formFootnote: blank },
      DEFAULTS
    )
    expect(result.rulesNote).toEqual(blank)
    expect(result.policyNote).toEqual(blank)
    expect(result.formFootnote).toEqual(blank)
  })
})

describe("eventDetailDefaults", () => {
  test("reads the shared event copy for a branch without an override", () => {
    const item = he.eventDetails.items.birthdays
    const enItem = en.eventDetails.items.birthdays
    const defaults = eventDetailDefaults("ramat-gan", "birthdays")

    expect(defaults.allowedItems).toEqual(
      item.allowed.map((text, i) => ({ he: text, en: enItem.allowed[i] }))
    )
    expect(defaults.forbiddenItems).toEqual(
      item.forbidden.map((text, i) => ({ he: text, en: enItem.forbidden[i] }))
    )
    expect(defaults.policyItems).toEqual(
      item.policy.map((row, i) => ({
        title: { he: row.title, en: enItem.policy[i].title },
        description: { he: row.desc, en: enItem.policy[i].desc },
      }))
    )
    expect(defaults.rulesNote).toEqual({ he: "", en: "" })
    expect(defaults.policyNote).toEqual({ he: "", en: "" })
    expect(defaults.upgradesTitle).toEqual({
      he: he.eventDetails.form.upgradesTitle,
      en: en.eventDetails.form.upgradesTitle,
    })
    expect(defaults.upgradesNote).toEqual({
      he: he.eventDetails.form.upgradesNote,
      en: en.eventDetails.form.upgradesNote,
    })
  })

  test("prefers the branch-specific override when one exists", () => {
    const override = he.eventDetails.branch.rishon.birthdays
    const enOverride = en.eventDetails.branch.rishon.birthdays
    const defaults = eventDetailDefaults("rishon", "birthdays")

    expect(defaults.allowedItems.map((item) => item.he)).toEqual(
      override.allowed
    )
    expect(defaults.rulesNote).toEqual({
      he: override.rulesFootnote,
      en: enOverride.rulesFootnote,
    })
    expect(defaults.policyNote).toEqual({
      he: override.policyFootnote,
      en: enOverride.policyFootnote,
    })
    expect(defaults.policyItems).toHaveLength(override.policy.length)
  })

  test("takes the form texts from the shared booking form copy", () => {
    const defaults = eventDetailDefaults("ramat-gan", "gymboree")
    expect(defaults.formIntro).toEqual({
      he: he.eventDetails.form.desc,
      en: en.eventDetails.form.desc,
    })
    expect(defaults.formTerms).toEqual({
      he: he.eventDetails.form.termsConfirm,
      en: en.eventDetails.form.termsConfirm,
    })
    expect(defaults.formFootnote).toEqual({
      he: he.eventDetails.form.footnote,
      en: en.eventDetails.form.footnote,
    })
  })

  test("returns empty sections for an event type with no default copy", () => {
    const defaults = eventDetailDefaults("ramat-gan", "brand-new-event")
    expect(defaults.allowedItems).toEqual([])
    expect(defaults.forbiddenItems).toEqual([])
    expect(defaults.policyItems).toEqual([])
    expect(defaults.rulesNote).toEqual({ he: "", en: "" })
  })

  test("returns empty sections for corporate, which has no rules or policy", () => {
    const defaults = eventDetailDefaults("ramat-gan", "corporate")
    expect(defaults.allowedItems).toEqual([])
    expect(defaults.policyItems).toEqual([])
  })

  test("titles the steps section per event type, else the shared heading", () => {
    expect(eventDetailDefaults("rishon", "corporate").scheduleTitle).toEqual({
      he: "איך זה עובד?",
      en: "How it works",
    })
    expect(eventDetailDefaults("rishon", "birthdays").scheduleTitle).toEqual({
      he: he.eventDetails.scheduleTitle,
      en: en.eventDetails.scheduleTitle,
    })
  })
})

describe("defaultBookingFields", () => {
  test("keeps the keys the booking email route reads (name and reply-to)", () => {
    expect(defaultBookingFields().map((field) => field.key)).toEqual([
      "firstName",
      "lastName",
      "idNumber",
      "celebrants",
      "email",
      "phone",
      "date",
    ])
  })

  test("labels and placeholders come from the booking form copy in both locales", () => {
    const [firstName, , idNumber] = defaultBookingFields()
    expect(firstName.label).toEqual({
      he: he.eventDetails.form.firstNameLabel,
      en: en.eventDetails.form.firstNameLabel,
    })
    expect(firstName.placeholder).toEqual({
      he: he.eventDetails.form.firstNamePlaceholder,
      en: en.eventDetails.form.firstNamePlaceholder,
    })
    expect(idNumber.type).toBe("id")
    expect(idNumber.label.he).toBe(he.eventDetails.form.idLabel)
  })

  test("only the celebrants field is optional", () => {
    const optional = defaultBookingFields().filter((f) => !f.isRequired)
    expect(optional.map((field) => field.key)).toEqual(["celebrants"])
  })

  test("a field without placeholder copy gets a blank placeholder", () => {
    const date = defaultBookingFields().find((field) => field.key === "date")
    expect(date?.placeholder).toEqual({ he: "", en: "" })
  })
})

describe("defaultFormFields", () => {
  test("returns the default fields for events that show the booking form", () => {
    expect(defaultFormFields("ramat-gan", "birthdays")).toEqual(
      defaultBookingFields()
    )
    expect(defaultFormFields("rishon", "birthdays")).toHaveLength(7)
    expect(defaultFormFields("rishon", "gymboree")).toHaveLength(7)
  })

  test("returns no fields for events that use the contact form instead", () => {
    expect(defaultFormFields("ramat-gan", "team")).toEqual([])
    expect(defaultFormFields("ramat-gan", "corporate")).toEqual([])
    expect(defaultFormFields("ramat-gan", "brand-new-event")).toEqual([])
  })
})
