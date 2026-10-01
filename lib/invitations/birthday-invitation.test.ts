import { describe, expect, test } from "bun:test"

import { BRANCHES } from "@/lib/branches"

import {
  birthdayInvitation,
  branchCity,
  partyWhen,
} from "./birthday-invitation"

describe("partyWhen", () => {
  test("turns the form's date into the Hebrew weekday and a short date", () => {
    expect(partyWhen("2026-10-08")).toBe("יום חמישי | תאריך: 08.10.26")
  })

  test("keeps an unparseable or impossible date as typed", () => {
    expect(partyWhen("8/10")).toBe("תאריך: 8/10")
    expect(partyWhen("2026-02-30")).toBe("תאריך: 2026-02-30")
  })

  test("is empty when no date was given", () => {
    expect(partyWhen("  ")).toBe("")
    expect(partyWhen(undefined)).toBe("")
    expect(partyWhen(20261008)).toBe("")
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

describe("birthdayInvitation", () => {
  test("fills the invitation from the booking and the branch", () => {
    expect(
      birthdayInvitation(
        { celebrants: "  אליה קורן ", date: "2026-10-08" },
        BRANCHES.rishon
      )
    ).toEqual({
      city: "ראשון לציון",
      when: "יום חמישי | תאריך: 08.10.26",
      celebrants: "אליה קורן",
      footer: `באולינג ראשון לציון | ${BRANCHES.rishon.addressFull.he} | ${BRANCHES.rishon.phone}`,
      logoSrc: BRANCHES.rishon.logo.src,
    })
  })

  test("leaves the celebrants and date blank when they were not filled in", () => {
    const invitation = birthdayInvitation({}, BRANCHES["ramat-gan"])
    expect(invitation.celebrants).toBe("")
    expect(invitation.when).toBe("")
  })
})
