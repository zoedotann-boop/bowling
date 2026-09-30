import { describe, expect, test } from "bun:test"

import { ADMIN_ROLES, can } from "./permissions"
import {
  ADMIN_SECTIONS,
  DEFAULT_ADMIN_SECTION,
  locationSectionPath,
  setPasswordPath,
} from "./routes"

describe("DEFAULT_ADMIN_SECTION", () => {
  const section = ADMIN_SECTIONS.find(
    ({ key }) => key === DEFAULT_ADMIN_SECTION
  )

  test("lands on the home section", () => {
    expect(locationSectionPath("rishon", DEFAULT_ADMIN_SECTION)).toBe(
      "/admin/rishon/home"
    )
  })

  test("is a registered section", () => {
    expect(section).toBeDefined()
  })

  test.each([...ADMIN_ROLES])("is accessible to the %s role", (role) => {
    expect(can(role, section!.capability)).toBe(true)
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
