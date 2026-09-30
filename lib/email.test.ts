import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

const send = mock<
  (payload: Record<string, unknown>) => Promise<{ error: unknown }>
>(async () => ({ error: null }))

mock.module("server-only", () => ({}))
mock.module("@/lib/db", () => ({ db: {} }))
mock.module("resend", () => ({
  Resend: class {
    emails = { send }
  },
}))

const { noReplySender, sendMail } = await import("./email")

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
    await sendMail({ ...input, from: "no-reply@otp.example.com" })
    expect(send.mock.calls[0][0].from).toBe("no-reply@otp.example.com")
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
    expect(
      await sendMail({ ...input, from: "no-reply@otp.example.com" })
    ).toEqual({ ok: true })
  })

  test("reports send_failed when Resend returns an error", async () => {
    send.mockImplementationOnce(async () => ({ error: { message: "boom" } }))
    expect(await sendMail(input)).toEqual({ ok: false, reason: "send_failed" })
  })
})

describe("noReplySender", () => {
  test("uses the BETTER_AUTH_URL host", () => {
    expect(noReplySender("https://bowling.example.com")).toBe(
      "no-reply@bowling.example.com"
    )
  })

  test("ignores port, path and trailing slash", () => {
    expect(noReplySender("https://example.com:8443/app/")).toBe(
      "no-reply@example.com"
    )
  })

  test("drops a leading www.", () => {
    expect(noReplySender("https://www.example.com")).toBe(
      "no-reply@example.com"
    )
  })

  test.each([
    ["unset", undefined],
    ["empty", ""],
    ["not a URL", "example.com"],
    ["localhost", "http://localhost:3000"],
    ["an IPv4 address", "http://127.0.0.1:3000"],
    ["an IPv6 address", "http://[::1]:3000"],
  ])("returns undefined when the URL is %s", (_, url) => {
    expect(noReplySender(url)).toBeUndefined()
  })
})
