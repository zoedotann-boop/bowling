import { describe, expect, test } from "bun:test"

import { passwordEmail } from "./auth-email"

const url =
  "https://bowlingil.com/api/auth/reset-password/token123?callbackURL=%2Fadmin"

describe("passwordEmail", () => {
  test("invites a member without a password to choose one", () => {
    const { subject, html } = passwordEmail("invite", url)

    expect(subject).toContain("הוזמנתם")
    expect(html).toContain("ברוכים הבאים לאזור הניהול")
    expect(html).toContain(">בחירת סיסמה</a>")
    expect(html).toContain("קוד חד-פעמי")
  })

  test("asks a member with a password to reset it", () => {
    const { subject, html } = passwordEmail("reset", url)

    expect(subject).toContain("איפוס")
    expect(html).toContain(">בחירת סיסמה חדשה</a>")
    expect(html).toContain("הסיסמה הנוכחית לא תשתנה")
  })

  test.each(["invite", "reset"] as const)(
    "the %s email links to the password page and says how long the link lasts",
    (kind) => {
      const { html } = passwordEmail(kind, url)

      expect(html).toContain(`href="${url}"`)
      expect(html).toContain("תקף ל-24 שעות")
    }
  )
})
