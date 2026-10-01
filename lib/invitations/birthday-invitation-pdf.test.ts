import { describe, expect, test } from "bun:test"

import { BRANCHES } from "@/lib/branches"

import { birthdayInvitationAttachment } from "./birthday-invitation-pdf"

const booking = { celebrants: "אליה קורן", date: "2026-10-08" }

describe("birthdayInvitationAttachment", () => {
  test.each(["birthdays", "gymboree", "no-room"])(
    "attaches a one-page A4 landscape PDF for the %s event",
    async (slug) => {
      const attachment = await birthdayInvitationAttachment(
        { ...booking, slug },
        BRANCHES.rishon
      )
      expect(attachment?.filename).toBe("birthday-invitation.pdf")
      const pdf = attachment!.content.toString("latin1")
      expect(pdf.startsWith("%PDF-")).toBe(true)
      expect(pdf.match(/\/Type \/Page\b/g)).toHaveLength(1)
      const mediaBox = /\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/.exec(pdf)
      expect(
        mediaBox?.slice(1).map((size) => Math.round(Number(size)))
      ).toEqual([842, 595])
    }
  )

  test("renders for every branch logo even without celebrants or date", async () => {
    for (const branch of Object.values(BRANCHES)) {
      const attachment = await birthdayInvitationAttachment(
        { slug: "birthdays" },
        branch
      )
      expect(attachment?.content.length).toBeGreaterThan(0)
    }
  })

  test.each([["corporate"], ["team"], [undefined]])(
    "skips the invitation for a non-birthday event (%p)",
    async (slug) => {
      expect(
        await birthdayInvitationAttachment(
          { ...booking, slug },
          BRANCHES.rishon
        )
      ).toBeUndefined()
    }
  )
})
