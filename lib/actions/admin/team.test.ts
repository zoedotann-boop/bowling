import { beforeEach, describe, expect, test } from "bun:test"

import { setPasswordPath } from "@/lib/admin/routes"
import { user } from "@/lib/db/schema"
import { resetLocations } from "@/lib/db/testing/admin-actions"
import { db, outbox } from "@/lib/db/testing/auth"

const { createTeamMember } = await import("./team")

const email = "new.manager@example.com"

beforeEach(async () => {
  await db.delete(user)
  outbox.clear()
})

describe("createTeamMember", () => {
  test("emails the new member an invitation to choose a password", async () => {
    const branch = await resetLocations()

    const result = await createTeamMember({
      name: "מנהל חדש",
      email: "New.Manager@Example.com",
      role: "manager",
      locationIds: [branch.id],
    })

    expect(result).toEqual({ ok: true })
    expect(outbox.passwordLinks).toHaveLength(1)
    const [invite] = outbox.passwordLinks
    expect(invite).toMatchObject({ to: email, kind: "invite" })
    expect(new URL(invite.url).searchParams.get("callbackURL")).toBe(
      setPasswordPath(email)
    )
  })

  test("doesn't invite anyone when the email is already taken", async () => {
    const member = { name: "בעלים", email, role: "owner", locationIds: [] }
    await createTeamMember(member)
    outbox.clear()

    const result = await createTeamMember(member)

    expect(result).toEqual({ ok: false, error: "email-taken" })
    expect(outbox.passwordLinks).toHaveLength(0)
  })
})
