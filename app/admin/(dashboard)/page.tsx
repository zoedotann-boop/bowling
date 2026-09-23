import { redirect } from "next/navigation"

import { listAccessibleLocations, requireAdminUser } from "@/lib/admin/access"
import { locationSectionPath } from "@/lib/admin/routes"

// Entry point: send the user to the first accessible location's settings, or to
// the owner locations manager when there are none yet.
export default async function AdminHomePage() {
  const user = await requireAdminUser()
  const locations = await listAccessibleLocations(user)

  if (locations.length === 0) {
    redirect(user.role === "owner" ? "/admin/locations" : "/admin/login")
  }

  redirect(locationSectionPath(locations[0].slug, "general"))
}
