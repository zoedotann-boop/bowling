import { redirect } from "next/navigation"

import { listAccessibleLocations, requireAdminUser } from "@/lib/admin/access"
import { DEFAULT_ADMIN_SECTION, locationSectionPath } from "@/lib/admin/routes"

export default async function AdminHomePage() {
  const user = await requireAdminUser()
  const locations = await listAccessibleLocations(user)

  if (locations.length === 0) {
    redirect(user.role === "owner" ? "/admin/locations" : "/admin/login")
  }

  redirect(locationSectionPath(locations[0].slug, DEFAULT_ADMIN_SECTION))
}
