import { describe, expect, test } from "bun:test"

import { BRANCHES } from "@/lib/branches"

import {
  arrivalTime,
  branchCity,
  eventInvitation,
  partyWhen,
} from "./invitation"

describe("arrivalTime", () => {
  test("invites guests 15 minutes before the booked time", () => {
    expect(arrivalTime("17:00")).toBe("16:45")
    expect(arrivalTime("17:30")).toBe("17:15")
    expect(arrivalTime("9:10")).toBe("08:55")
  })

  test("wraps past midnight", () => {
    expect(arrivalTime("00:10")).toBe("23:55")
  })

  test("keeps a time it cannot read as given", () => {
    expect(arrivalTime("אחה״צ")).toBe("אחה״צ")
    expect(arrivalTime("25:00")).toBe("25:00")
  })
})

describe("partyWhen", () => {
  test("turns the form's date into the Hebrew weekday and a short date", () => {
    expect(partyWhen("2026-10-08", "")).toBe("יום חמישי | תאריך: 08.10.26")
  })

  test("adds the arrival time, 15 minutes early, after the date", () => {
    expect(partyWhen("2026-10-08", "17:00")).toBe(
      "יום חמישי | תאריך: 08.10.26 | שעה: 16:45"
    )
  })

  test("shows the time alone when there is no date", () => {
    expect(partyWhen("", "17:30")).toBe("שעה: 17:15")
  })

  test("keeps an unparseable or impossible date as typed", () => {
    expect(partyWhen("8/10", "")).toBe("תאריך: 8/10")
    expect(partyWhen("2026-02-30", "")).toBe("תאריך: 2026-02-30")
  })

  test("is empty when neither a date nor a time was given", () => {
    expect(partyWhen("", "")).toBe("")
  })
})

describe("branchCity", () => {
  test("drops the branch prefix from the Hebrew branch name", () => {
    expect(branchCity(BRANCHES.rishon)).toBe("ראשון לציון")
    expect(branchCity(BRANCHES["ramat-gan"])).toBe("רמת גן")
  })

  test("keeps a name that has no branch prefix", () => {
    expect(
      branchCity({ ...BRANCHES.rishon, name: { he: "חולון", en: "Holon" } })
    ).toBe("חולון")
  })
})

describe("eventInvitation", () => {
  test("fills a birthday invitation from the booking and the branch", () => {
    expect(
      eventInvitation(
        {
          slug: "birthdays",
          firstName: "דנה",
          celebrants: "  אליה קורן ",
          date: "2026-10-08",
        },
        BRANCHES.rishon
      )
    ).toEqual({
      message:
        "אז החלטתי לחגוג בבאולינג ראשון לציון!\nאשמח להזמין אותך למסיבת יום ההולדת הכי שווה שיש!",
      when: "יום חמישי | תאריך: 08.10.26",
      host: "אליה קורן",
      footer: `באולינג ראשון לציון | ${BRANCHES.rishon.addressFull.he} | ${BRANCHES.rishon.phone}`,
    })
  })

  test("uses the branch's current details", () => {
    const branch = {
      ...BRANCHES.rishon,
      phone: "03-1234567",
      addressFull: { he: "דוד סחרוב 19, ראשון לציון", en: "" },
    }
    expect(eventInvitation({ slug: "birthdays" }, branch).footer).toBe(
      "באולינג ראשון לציון | דוד סחרוב 19, ראשון לציון | 03-1234567"
    )
  })

  test("invites to a general party for events that are not birthdays", () => {
    expect(
      eventInvitation({ slug: "event-6" }, BRANCHES["ramat-gan"]).message
    ).toBe("אז החלטתי לחגוג בבאולינג רמת גן!\nאשמח להזמין אותך לחגוג איתי!")
  })

  test("signs with the customer's first name when no celebrants were given", () => {
    expect(
      eventInvitation(
        { firstName: " דנה ", lastName: "כהן", celebrants: " " },
        BRANCHES.rishon
      ).host
    ).toBe("דנה")
  })

  test("reads the date and time from the fields of those types", () => {
    expect(
      eventInvitation(
        {
          field_a: "2026-10-08",
          field_b: "18:00",
          types: { field_a: "date", field_b: "time", firstName: "text" },
        },
        BRANCHES.rishon
      ).when
    ).toBe("יום חמישי | תאריך: 08.10.26 | שעה: 17:45")
  })

  test("skips an empty typed field and falls back to the built-in date", () => {
    expect(
      eventInvitation(
        {
          date: "2026-10-08",
          field_a: "",
          types: { field_a: "date", date: "date" },
        },
        BRANCHES.rishon
      ).when
    ).toBe("יום חמישי | תאריך: 08.10.26")
    expect(eventInvitation({ date: "2026-10-08" }, BRANCHES.rishon).when).toBe(
      "יום חמישי | תאריך: 08.10.26"
    )
  })

  test("leaves the host and date blank when they were not filled in", () => {
    const invitation = eventInvitation({}, BRANCHES["ramat-gan"])
    expect(invitation.host).toBe("")
    expect(invitation.when).toBe("")
  })
})
