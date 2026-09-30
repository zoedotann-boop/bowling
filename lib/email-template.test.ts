import { describe, expect, test } from "bun:test"

import { BRANCHES } from "@/lib/branches"

import { actionButton, emailShell, linkFallback } from "./email-template"

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

describe("password link helpers", () => {
  const url =
    "https://bowlingil.com/api/auth/reset-password/abc?callbackURL=%2Fadmin%2Fset-password%3Femail%3Da%2540b.com&x=1"

  test("actionButton links to the escaped URL with its label", () => {
    const html = actionButton(url, "בחירת סיסמה")
    expect(html).toContain(`href="${url.replace("&", "&amp;")}"`)
    expect(html).toContain(">בחירת סיסמה</a>")
  })

  test("linkFallback prints the URL as copyable text", () => {
    const html = linkFallback("העתיקו:", url)
    expect(html).toContain("העתיקו:")
    expect(html).toContain(`>${url.replace("&", "&amp;")}</a>`)
  })

  test("escapes markup in the URL", () => {
    expect(actionButton('https://x.com/"><script>', "Go")).not.toContain(
      "<script>"
    )
  })
})
