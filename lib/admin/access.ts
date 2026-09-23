import "server-only"

import { and, asc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { location, locationMember } from "@/lib/db/schema"

import type { AdminCapability, AdminRole } from "./permissions"
import { can } from "./permissions"
import { ADMIN_LOGIN_PATH } from "./routes"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole
}

async function getSessionUser(): Promise<AdminUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null
  const { id, name, email, role } = session.user
  return { id, name, email, role: (role as AdminRole) ?? "staff" }
}

// Every admin page/action funnels through here. Redirects to the login page
// when there is no session.
export async function requireAdminUser(): Promise<AdminUser> {
  const user = await getSessionUser()
  if (!user) redirect(ADMIN_LOGIN_PATH)
  return user
}

// Owner-only top-level pages (locations, team).
export async function requireOwnerAccess(): Promise<AdminUser> {
  const user = await requireAdminUser()
  if (user.role !== "owner") notFound()
  return user
}

// Resolves a location slug and asserts the user may act on it with the given
// capability. Owners bypass membership; managers/staff must be members.
export async function requireLocationAccess(
  slug: string,
  capability?: AdminCapability
) {
  const user = await requireAdminUser()

  const loc = await db.query.location.findFirst({
    where: eq(location.slug, slug),
  })
  if (!loc) notFound()

  if (capability && !can(user.role, capability)) notFound()

  if (user.role !== "owner") {
    const membership = await db.query.locationMember.findFirst({
      where: and(
        eq(locationMember.userId, user.id),
        eq(locationMember.locationId, loc.id)
      ),
    })
    if (!membership) notFound()
  }

  return { user, location: loc }
}

// The set of locations a user may see in the switcher: all for owners, only
// their memberships otherwise.
export async function listAccessibleLocations(user: AdminUser) {
  if (user.role === "owner") {
    return db.query.location.findMany({ orderBy: [asc(location.sortOrder)] })
  }
  const rows = await db.query.locationMember.findMany({
    where: eq(locationMember.userId, user.id),
    with: { location: true },
  })
  return rows
    .map((row) => row.location)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
