import { getLocale } from "next-intl/server"

import { TeamManager } from "@/components/admin/sections/team-manager"
import { requireOwnerAccess } from "@/lib/admin/access"
import { listAllLocations, listTeam } from "@/lib/db/queries/admin"
import { pickLocale } from "@/lib/localized"
import type { Locale } from "@/lib/locales"

// Owner-only: add, edit and remove admin users and their location access.
// There is no public signup — this page is how people get into the admin.
export default async function TeamPage() {
  const owner = await requireOwnerAccess()
  const [team, locations, locale] = await Promise.all([
    listTeam(),
    listAllLocations(),
    getLocale() as Promise<Locale>,
  ])

  return (
    <TeamManager
      locations={locations.map((item) => ({
        id: item.id,
        name: pickLocale(item.name, locale),
      }))}
      members={team.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        locationIds: member.memberships.map((entry) => entry.locationId),
        isSelf: member.id === owner.id,
      }))}
    />
  )
}
