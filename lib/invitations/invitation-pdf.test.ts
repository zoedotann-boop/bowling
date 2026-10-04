import { afterAll, describe, expect, spyOn, test } from "bun:test"

import { BRANCHES } from "@/lib/branches"

import { invitationAttachment } from "./invitation-pdf"

const booking = {
  firstName: "דנה",
  celebrants: "אליה קורן",
  date: "2026-10-08",
  field_time: "17:30",
  types: { date: "date", field_time: "time" },
}

function expectInvitationPdf(content: Buffer | undefined) {
  const pdf = content!.toString("latin1")
  expect(pdf.startsWith("%PDF-")).toBe(true)
  expect(pdf.match(/\/Type \/Page\b/g)).toHaveLength(1)
  const mediaBox = /\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/.exec(pdf)
  expect(mediaBox?.slice(1).map((size) => Math.round(Number(size)))).toEqual([
    842, 595,
  ])
}

describe("invitationAttachment", () => {
  test.each(["birthdays", "gymboree", "no-room", "event-6", undefined])(
    "attaches a one-page A4 landscape PDF for the %p booking form",
    async (slug) => {
      const attachment = await invitationAttachment(
        { ...booking, slug },
        BRANCHES.rishon
      )
      expect(attachment?.filename).toBe("invitation.pdf")
      expectInvitationPdf(attachment?.content)
    }
  )

  test("renders for every branch logo even without a name, date or time", async () => {
    for (const branch of Object.values(BRANCHES)) {
      const attachment = await invitationAttachment(
        { slug: "birthdays" },
        branch
      )
      expect(attachment?.content.length).toBeGreaterThan(0)
    }
  })

  describe("branch logo", () => {
    const server = Bun.serve({
      port: 0,
      fetch: (req) =>
        new URL(req.url).pathname === "/logo.png"
          ? new Response(Bun.file("public/logo-ramat-gan.png"))
          : new Response("<svg/>", {
              headers: { "Content-Type": "image/svg+xml" },
            }),
    })
    afterAll(() => server.stop())

    const withLogo = (src: string) => ({
      ...BRANCHES["ramat-gan"],
      logo: { ...BRANCHES["ramat-gan"].logo, src },
    })

    test("draws an uploaded PNG logo", async () => {
      const warn = spyOn(console, "warn").mockImplementation(() => {})
      const attachment = await invitationAttachment(
        booking,
        withLogo(new URL("/logo.png", server.url).href)
      )
      expectInvitationPdf(attachment?.content)
      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })

    test.each([
      ["missing", "/missing-logo.png"],
      ["an SVG", new URL("/logo.svg", server.url).href],
    ])("falls back to the bundled logo when the logo is %s", async (_, src) => {
      const warn = spyOn(console, "warn").mockImplementation(() => {})
      const attachment = await invitationAttachment(booking, withLogo(src))
      expectInvitationPdf(attachment?.content)
      expect(warn).toHaveBeenCalledTimes(1)
      warn.mockRestore()
    })
  })
})
