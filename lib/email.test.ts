import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

import { BRANCHES } from "@/lib/branches"
import { location } from "@/lib/db/schema"
import { testDb as db } from "@/lib/db/testing/preload"

const send = mock<
  (payload: Record<string, unknown>) => Promise<{ error: unknown }>
>(async () => ({ error: null }))

mock.module("resend", () => ({
  Resend: class {
    emails = { send }
  },
}))

const { loginSender, resolveBranch, sendMail } = await import("./email")

const input = { to: "guest@example.com", subject: "Hi", html: "<p>Hi</p>" }
const env = { ...process.env }

beforeEach(() => {
  send.mockClear()
  process.env.RESEND_API_KEY = "re_test"
  process.env.CONTACT_FROM_EMAIL = "events@example.com"
})

afterEach(() => {
  process.env = { ...env }
})

describe("sendMail", () => {
  test("sends from CONTACT_FROM_EMAIL by default", async () => {
    expect(await sendMail(input)).toEqual({ ok: true })
    expect(send.mock.calls[0][0]).toEqual({
      ...input,
      from: "events@example.com",
    })
  })

  test("an explicit sender overrides CONTACT_FROM_EMAIL", async () => {
    await sendMail({ ...input, from: "login@otp.example.com" })
    expect(send.mock.calls[0][0].from).toBe("login@otp.example.com")
  })

  test("an empty sender falls back to CONTACT_FROM_EMAIL", async () => {
    await sendMail({ ...input, from: "" })
    expect(send.mock.calls[0][0].from).toBe("events@example.com")
  })

  test("reports not_configured without an API key", async () => {
    delete process.env.RESEND_API_KEY
    expect(await sendMail(input)).toEqual({
      ok: false,
      reason: "not_configured",
    })
    expect(send).not.toHaveBeenCalled()
  })

  test("reports not_configured without any sender", async () => {
    delete process.env.CONTACT_FROM_EMAIL
    expect(await sendMail(input)).toEqual({
      ok: false,
      reason: "not_configured",
    })
  })

  test("uses an explicit sender even when CONTACT_FROM_EMAIL is unset", async () => {
    delete process.env.CONTACT_FROM_EMAIL
    expect(await sendMail({ ...input, from: "login@otp.example.com" })).toEqual(
      { ok: true }
    )
  })

  test("reports send_failed when Resend returns an error", async () => {
    send.mockImplementationOnce(async () => ({ error: { message: "boom" } }))
    expect(await sendMail(input)).toEqual({ ok: false, reason: "send_failed" })
  })
})

describe("loginSender", () => {
  test("uses the BETTER_AUTH_URL host", () => {
    expect(loginSender("https://bowling.example.com")).toBe(
      "login@bowling.example.com"
    )
  })

  test("ignores port, path and trailing slash", () => {
    expect(loginSender("https://example.com:8443/app/")).toBe(
      "login@example.com"
    )
  })

  test("drops a leading www.", () => {
    expect(loginSender("https://www.example.com")).toBe("login@example.com")
  })

  test.each([
    ["unset", undefined],
    ["empty", ""],
    ["not a URL", "example.com"],
    ["localhost", "http://localhost:3000"],
    ["an IPv4 address", "http://127.0.0.1:3000"],
    ["an IPv6 address", "http://[::1]:3000"],
  ])("falls back to bowlingil.com when the URL is %s", (_, url) => {
    expect(loginSender(url)).toBe("login@bowlingil.com")
  })
})

describe("resolveBranch", () => {
  beforeEach(async () => {
    await db.delete(location)
  })

  test("uses the branch details saved in the admin", async () => {
    await db.insert(location).values({
      slug: "rishon",
      name: { he: "סניף ראשון לציון", en: "Rishon LeZion Branch" },
      addressLine1: { he: "הרצל 1", en: "Herzl St 1" },
      addressFull: { he: "הרצל 1, ראשון לציון", en: "" },
      phone: "03-1234567",
    })

    const branch = await resolveBranch("rishon")
    expect(branch.phone).toBe("03-1234567")
    expect(branch.addressFull).toEqual({
      he: "הרצל 1, ראשון לציון",
      en: BRANCHES.rishon.addressFull.en,
    })
  })

  test("falls back to the built-in details and the default branch", async () => {
    expect(await resolveBranch("rishon")).toMatchObject({
      phone: BRANCHES.rishon.phone,
      addressFull: BRANCHES.rishon.addressFull,
    })
    expect((await resolveBranch("nowhere")).id).toBe("ramat-gan")
  })
})
