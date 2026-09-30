import { describe, expect, test } from "bun:test"

import { featureIconAt } from "./home"

describe("featureIconAt", () => {
  test("uses the chosen icon", () => {
    expect(featureIconAt("bar", 0)).toBe("bar")
  })

  test("falls back to the icon for the card's position", () => {
    expect(featureIconAt("", 0)).toBe("lanes")
    expect(featureIconAt("unknown", 3)).toBe("openLate")
    expect(featureIconAt("", 5)).toBe("everyone")
  })
})
