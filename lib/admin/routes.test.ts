import { describe, expect, test } from "bun:test"

import { ADMIN_ROLES, can } from "./permissions"
import {
  ADMIN_SECTIONS,
  DEFAULT_ADMIN_SECTION,
  locationSectionPath,
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
