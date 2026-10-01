import { describe, expect, test } from "bun:test"

import { featureIconAt, serviceIconAt } from "./home"

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

describe("serviceIconAt", () => {
  test("uses the chosen illustration", () => {
    expect(serviceIconAt("gymboree", 0)).toBe("gymboree")
    expect(serviceIconAt("clock", 4)).toBe("clock")
  })

  test("falls back to bowling, party, menu by the card's position", () => {
    expect(serviceIconAt("", 0)).toBe("bowling")
    expect(serviceIconAt("", 1)).toBe("party")
    expect(serviceIconAt("lanes", 2)).toBe("menu")
    expect(serviceIconAt("", 3)).toBe("bowling")
    expect(serviceIconAt("", 4)).toBe("party")
  })
})
