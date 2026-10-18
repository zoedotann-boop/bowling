import { describe, expect, test } from "bun:test"

import { HONEYPOT_FIELD, isHoneypotFilled } from "./honeypot"

describe("isHoneypotFilled", () => {
  test("is false when the trap field is missing", () => {
    expect(isHoneypotFilled({ name: "Dana" })).toBe(false)
  })

  test("is false when the trap field is empty or whitespace", () => {
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "" })).toBe(false)
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "   " })).toBe(false)
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: null })).toBe(false)
  })

  test("is true when the trap field has any value", () => {
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: "https://spam.example" })).toBe(
      true
    )
    expect(isHoneypotFilled({ [HONEYPOT_FIELD]: 0 })).toBe(true)
  })
})
