import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  buildSystem,
  buildUserPrompt,
  MAX_FIELDS_PER_CALL,
  TooManyFieldsError,
  translateFields,
} from "../translate"
import { __resetForTests, consume, RateLimitError } from "../rate-limit"

const generateText = vi.fn()

vi.mock("ai", () => ({
  generateText: (args: unknown) => generateText(args),
  Output: {
    object: (args: { schema: unknown }) => ({ kind: "object", ...args }),
  },
}))

describe("buildSystem / buildUserPrompt", () => {
  it("includes source and target language names in system prompt", () => {
    const sys = buildSystem("en")
    expect(sys).toContain("Hebrew")
    expect(sys).toContain("English")
  })

  it("embeds fields JSON into the user prompt", () => {
    const prompt = buildUserPrompt({
      targetLocale: "ru",
      fields: { displayName: "בית באולינג", city: "רמת גן" },
      domainHint: "Ramat Gan",
    })
    expect(prompt).toContain("Russian")
    expect(prompt).toContain("(ru)")
    expect(prompt).toContain("Ramat Gan")
    expect(prompt).toContain("בית באולינג")
    expect(prompt).toContain("רמת גן")
  })
})

describe("translateFields", () => {
  beforeEach(() => {
    generateText.mockReset()
  })

  it("calls the gateway with Hebrew source + locale-appropriate system prompt", async () => {
    generateText.mockResolvedValueOnce({
      output: { displayName: "Bowling House", city: "Ramat Gan" },
    })
    const result = await translateFields({
      targetLocale: "en",
      fields: { displayName: "בית באולינג", city: "רמת גן" },
    })
    expect(result).toEqual({
      displayName: "Bowling House",
      city: "Ramat Gan",
    })
    expect(generateText).toHaveBeenCalledTimes(1)
    const callArg = generateText.mock.calls[0][0]
    expect(callArg.model).toBe("anthropic/claude-haiku-4.5")
    expect(callArg.system).toContain("Hebrew")
    expect(callArg.system).toContain("English")
    expect(callArg.prompt).toContain("בית באולינג")
    expect(callArg.temperature).toBe(0.2)
  })

  it("strips empty values before calling the gateway", async () => {
    generateText.mockResolvedValueOnce({ output: { displayName: "Hello" } })
    await translateFields({
      targetLocale: "en",
      fields: { displayName: "שלום", shortName: "", city: "   " },
    })
    const { prompt } = generateText.mock.calls[0][0]
    expect(prompt).toContain("displayName")
    expect(prompt).not.toContain("shortName")
    expect(prompt).not.toContain('"city"')
  })

  it("returns empty object without calling the gateway when all fields are empty", async () => {
    const result = await translateFields({
      targetLocale: "en",
      fields: { displayName: "", shortName: "" },
    })
    expect(result).toEqual({})
    expect(generateText).not.toHaveBeenCalled()
  })

  it("throws TooManyFieldsError above the cap", async () => {
    const fields = Object.fromEntries(
      Array.from({ length: MAX_FIELDS_PER_CALL + 1 }, (_, i) => [
        `f${i}`,
        "שלום",
      ])
    )
    await expect(
      translateFields({ targetLocale: "en", fields })
    ).rejects.toBeInstanceOf(TooManyFieldsError)
    expect(generateText).not.toHaveBeenCalled()
  })
})

describe("rate-limit", () => {
  beforeEach(() => {
    __resetForTests()
  })

  it("allows exactly 30 calls and rejects the 31st", () => {
    for (let i = 0; i < 30; i++) consume("user-1")
    expect(() => consume("user-1")).toThrowError(RateLimitError)
  })

  it("tracks buckets independently per user", () => {
    for (let i = 0; i < 30; i++) consume("user-a")
    expect(() => consume("user-a")).toThrowError(RateLimitError)
    expect(() => consume("user-b")).not.toThrow()
  })
})
