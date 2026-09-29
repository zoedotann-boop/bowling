import { describe, expect, test } from "bun:test"

import type { location } from "@/lib/db/schema"

import {
  BRANCHES,
  branchPath,
  isBranchId,
  mergeBranch,
  switchBranchPath,
} from "./branches"

type BranchRow = typeof location.$inferSelect

const base = BRANCHES.rishon

const row = (overrides: Partial<BranchRow> = {}): BranchRow => ({
  id: "00000000-0000-0000-0000-000000000000",
  slug: "rishon",
  isVisible: true,
  sortOrder: 0,
  name: { he: "", en: "" },
  addressLine1: { he: "", en: "" },
  addressLine2: null,
  addressFull: { he: "", en: "" },
  laneDesc: null,
  phone: "",
  whatsapp: "",
  email: "",
  inquiriesEmail: "",
  wazeUrl: "",
  logoUrl: null,
  lanes: 0,
  hasGymboree: base.hasGymboree,
  hasNotice: base.hasNotice,
  noticeTitle: null,
  noticeBody: null,
  googlePlaceId: null,
  googleReviewsAutoSync: false,
  hours: null,
  seoTitle: null,
  seoDescription: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  ...overrides,
})

describe("isBranchId", () => {
  test("accepts known branch ids only", () => {
    expect(isBranchId("rishon")).toBe(true)
    expect(isBranchId("ramat-gan")).toBe(true)
    expect(isBranchId("haifa")).toBe(false)
    expect(isBranchId(undefined)).toBe(false)
  })
})

describe("branchPath", () => {
  test("points at the branch home page by default", () => {
    expect(branchPath("rishon")).toBe("/rishon")
    expect(branchPath("rishon", "/")).toBe("/rishon")
  })

  test("prefixes site paths with the branch", () => {
    expect(branchPath("ramat-gan", "/menu")).toBe("/ramat-gan/menu")
    expect(branchPath("rishon", "/events/birthdays")).toBe(
      "/rishon/events/birthdays"
    )
  })
})

describe("switchBranchPath", () => {
  test("keeps the current page when switching branch", () => {
    expect(switchBranchPath("/ramat-gan/menu", "rishon")).toBe("/rishon/menu")
    expect(switchBranchPath("/rishon/events/gymboree", "ramat-gan")).toBe(
      "/ramat-gan/events/gymboree"
    )
  })

  test("switches between branch home pages", () => {
    expect(switchBranchPath("/ramat-gan", "rishon")).toBe("/rishon")
    expect(switchBranchPath("/ramat-gan/", "rishon")).toBe("/rishon")
  })
})

describe("mergeBranch", () => {
  test("keeps the built-in branch when there is no database row", () => {
    expect(mergeBranch(base, undefined)).toBe(base)
  })

  test("falls back to built-in values for blank database fields", () => {
    expect(mergeBranch(base, row())).toEqual(base)
  })

  test("prefers trimmed database values per language", () => {
    const merged = mergeBranch(
      base,
      row({
        name: { he: "  ראשון החדש ", en: " " },
        phone: "03-1234567",
        lanes: 20,
      })
    )
    expect(merged.name).toEqual({ he: "ראשון החדש", en: base.name.en })
    expect(merged.phone).toBe("03-1234567")
    expect(merged.lanes).toBe(20)
  })

  test("takes feature flags from the database even when false", () => {
    const merged = mergeBranch(base, row({ hasGymboree: false }))
    expect(merged.hasGymboree).toBe(false)
  })
})
