import { describe, expect, mock, test } from "bun:test"

import { BRANCHES } from "@/lib/branches"

mock.module("server-only", () => ({}))
mock.module("@/lib/db", () => ({ db: {} }))

const { emailShell } = await import("./email-template")

const branch = BRANCHES.rishon
const shell = (contactLinks?: boolean) =>
  emailShell({
    branch,
    preheader: "Preheader",
    heading: "Heading",
    body: "<p>Body</p>",
    contactLinks,
  })

describe("emailShell", () => {
  test("includes phone and WhatsApp links by default", () => {
    const html = shell()
    expect(html).toContain(`href="tel:${branch.phone}"`)
    expect(html).toContain(`href="https://wa.me/${branch.whatsapp}"`)
  })

  test("omits phone and WhatsApp links when contactLinks is false", () => {
    const html = shell(false)
    expect(html).not.toContain("tel:")
    expect(html).not.toContain("wa.me")
    expect(html).toContain(branch.addressFull.he)
  })
})
