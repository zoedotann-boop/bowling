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

export async function requireAdminUser(): Promise<AdminUser> {
  const user = await getSessionUser()
  if (!user) redirect(ADMIN_LOGIN_PATH)
  return user
}

export async function requireOwnerAccess(): Promise<AdminUser> {
  const user = await requireAdminUser()
  if (user.role !== "owner") notFound()
  return user
}

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
