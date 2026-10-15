import { describe, expect, test } from "bun:test"

import { ADMIN_ROLES } from "./permissions"
import {
  DEFAULT_ADMIN_SECTION,
  locationSectionPath,
  sectionsFor,
  setPasswordPath,
} from "./routes"

const keysFor = (role: (typeof ADMIN_ROLES)[number]) =>
  sectionsFor(role).map(({ key }) => key)

describe("DEFAULT_ADMIN_SECTION", () => {
  test("lands on the home section", () => {
    expect(locationSectionPath("rishon", DEFAULT_ADMIN_SECTION)).toBe(
      "/admin/rishon/home"
    )
  })

  test.each([...ADMIN_ROLES])("is accessible to the %s role", (role) => {
    expect(keysFor(role)).toContain(DEFAULT_ADMIN_SECTION)
  })
})

describe("sectionsFor", () => {
  test("managers run the day-to-day branch sections", () => {
    expect(keysFor("manager")).toEqual([
      "general",
      "home",
      "menu",
      "events",
      "legal",
    ])
  })

  test("Google reviews are for owners only", () => {
    expect(keysFor("owner")).toContain("reviews")
    expect(keysFor("manager")).not.toContain("reviews")
  })
})

describe("setPasswordPath", () => {
  test("carries the email so the page can sign the user in afterwards", () => {
    const path = setPasswordPath("dana+admin@example.com")
    const url = new URL(path, "https://bowlingil.com")

    expect(url.pathname).toBe("/admin/set-password")
    expect(url.searchParams.get("email")).toBe("dana+admin@example.com")
  })
})
