import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import { HONEYPOT_FIELD } from "@/lib/honeypot"
import { POST } from "./route"

const env = { ...process.env }

beforeEach(() => {
  delete process.env.RESEND_API_KEY
  process.env.EVENTS_TO_EMAIL = "inbox@example.com"
})

afterEach(() => {
  process.env = { ...env }
})

const submit = (body: Record<string, unknown>) =>
  POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "Dana", phone: "0500000000", ...body }),
    })
  )

describe("POST /api/contact honeypot", () => {
  test("pretends to succeed without sending when the trap is filled", async () => {
    const res = await submit({ [HONEYPOT_FIELD]: "https://spam.example" })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  test("still validates required fields before anything is sent", async () => {
    const res = await submit({ name: "", [HONEYPOT_FIELD]: "" })
    expect(res.status).toBe(400)
  })

  test("goes on to send when the trap is empty", async () => {
    const res = await submit({ [HONEYPOT_FIELD]: "" })
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: "Failed to send email." })
  })

  test("treats a whitespace-only trap as empty", async () => {
    const res = await submit({ [HONEYPOT_FIELD]: "  " })
    expect(res.status).toBe(500)
  })
})
