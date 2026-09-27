"use server"

import { randomUUID } from "node:crypto"

import { eq } from "drizzle-orm"
import { refresh } from "next/cache"

import { requireOwnerAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import { locationMember, user } from "@/lib/db/schema"

import {
  newTeamMemberSchema,
  type TeamMemberDraft,
  teamMemberSchema,
} from "./schemas"
import { type ActionResult, OK } from "./shared"

// Owner-only user management. Sign-in is passwordless and public signup is
// disabled, so creating the user row is all it takes to grant access: the new
// member requests a one-time code at /admin/login with this email. Every action
// ends with `refresh()` so the server-rendered team table re-renders.

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

// Non-owners with no location would have nowhere to land in the dashboard.
function missingLocations(member: TeamMemberDraft): boolean {
  return member.role !== "owner" && member.locationIds.length === 0
}

// Replaces a user's location memberships. Owners carry none.
async function setMemberships(
  tx: Transaction,
  userId: string,
  member: TeamMemberDraft
) {
  await tx.delete(locationMember).where(eq(locationMember.userId, userId))
  if (member.role === "owner") return
  await tx
    .insert(locationMember)
    .values(member.locationIds.map((locationId) => ({ userId, locationId })))
}

export async function createTeamMember(input: unknown): Promise<ActionResult> {
  await requireOwnerAccess()

  const parsed = newTeamMemberSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const { email, ...member } = parsed.data
  if (missingLocations(member)) return { ok: false, error: "no-locations" }

  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(user)
      .values({
        id: randomUUID(),
        name: member.name,
        email,
        emailVerified: true,
        role: member.role,
      })
      .onConflictDoNothing({ target: user.email })
      .returning({ id: user.id })
    if (!row) return false
    await setMemberships(tx, row.id, member)
    return true
  })
  if (!created) return { ok: false, error: "email-taken" }

  refresh()
  return OK
}

export async function updateTeamMember(
  userId: string,
  input: unknown
): Promise<ActionResult> {
  const owner = await requireOwnerAccess()

  const parsed = teamMemberSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const member = parsed.data
  // Owners can't demote themselves, so there is always at least one owner.
  if (userId === owner.id && member.role !== "owner") {
    return { ok: false, error: "cannot-demote-self" }
  }
  if (missingLocations(member)) return { ok: false, error: "no-locations" }

  await db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({ name: member.name, role: member.role })
      .where(eq(user.id, userId))
    await setMemberships(tx, userId, member)
  })

  refresh()
  return OK
}

// Sessions, accounts and memberships cascade with the user row, so access is
// revoked immediately.
export async function deleteTeamMember(userId: string): Promise<ActionResult> {
  const owner = await requireOwnerAccess()
  if (userId === owner.id) return { ok: false, error: "cannot-delete-self" }

  await db.delete(user).where(eq(user.id, userId))

  refresh()
  return OK
}
