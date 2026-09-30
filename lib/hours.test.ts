import { describe, expect, test } from "bun:test"

import { DEFAULT_HOURS } from "@/lib/branches"
import type { DayHours } from "@/lib/db/schema/locations"

import { formatHours, isOpenAt } from "./hours"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const israel = (iso: string) => new Date(`${iso}+03:00`)

describe("isOpenAt", () => {
  test("is open during a same-day span and closed outside it", () => {
    const hours: DayHours[] = [
      { day: 3, closed: false, open: "10:00", close: "22:00" },
    ]
    expect(isOpenAt(hours, israel("2026-09-30T09:59"))).toBe(false)
    expect(isOpenAt(hours, israel("2026-09-30T10:00"))).toBe(true)
    expect(isOpenAt(hours, israel("2026-09-30T21:59"))).toBe(true)
    expect(isOpenAt(hours, israel("2026-09-30T22:00"))).toBe(false)
  })

  test("keeps an overnight span open after midnight", () => {
    expect(isOpenAt(DEFAULT_HOURS, israel("2026-09-30T23:30"))).toBe(true)
    expect(isOpenAt(DEFAULT_HOURS, israel("2026-10-01T02:59"))).toBe(true)
    expect(isOpenAt(DEFAULT_HOURS, israel("2026-10-01T03:00"))).toBe(false)
    expect(isOpenAt(DEFAULT_HOURS, israel("2026-10-01T09:00"))).toBe(false)
  })

  test("a closed day ends the previous night's span on time", () => {
    const hours: DayHours[] = [
      { day: 2, closed: false, open: "10:00", close: "02:00" },
      { day: 3, closed: true },
    ]
    expect(isOpenAt(hours, israel("2026-09-30T01:00"))).toBe(true)
    expect(isOpenAt(hours, israel("2026-09-30T12:00"))).toBe(false)
  })

  test("treats missing or malformed days as closed", () => {
    const hours: DayHours[] = [{ day: 3, closed: false, open: "", close: "" }]
    expect(isOpenAt(hours, israel("2026-09-30T12:00"))).toBe(false)
    expect(isOpenAt([], israel("2026-09-30T12:00"))).toBe(false)
  })
})

describe("formatHours", () => {
  test("groups consecutive days with the same hours", () => {
    const hours: DayHours[] = [
      ...DEFAULT_HOURS.slice(0, 5),
      { day: 5, closed: false, open: "09:00", close: "03:00" },
      { day: 6, closed: true },
    ]
    expect(formatHours(hours, DAYS, "Closed")).toEqual([
      "Sun–Thu · 10:00–03:00",
      "Fri · 09:00–03:00",
      "Sat · Closed",
    ])
  })

  test("collapses a uniform week into one line", () => {
    expect(formatHours(DEFAULT_HOURS, DAYS, "Closed")).toEqual([
      "Sun–Sat · 10:00–03:00",
    ])
  })

  test("does not merge non-adjacent days", () => {
    const hours: DayHours[] = [
      { day: 0, closed: true },
      { day: 1, closed: false, open: "10:00", close: "20:00" },
      { day: 2, closed: true },
    ]
    expect(formatHours(hours, DAYS, "Closed")).toEqual([
      "Sun · Closed",
      "Mon · 10:00–20:00",
      "Tue · Closed",
    ])
  })
})
