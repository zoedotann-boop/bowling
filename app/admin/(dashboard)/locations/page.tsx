import { LocationsForm } from "@/components/admin/sections/locations-form"
import { requireOwnerAccess } from "@/lib/admin/access"
import { toLocalized } from "@/lib/admin/drafts"
import type { LocationsDraft } from "@/lib/actions/admin/schemas"
import { listAllLocations } from "@/lib/db/queries/admin"

export default async function LocationsPage() {
  await requireOwnerAccess()
  const locations = await listAllLocations()

  const draft: LocationsDraft = {
    locations: locations.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: toLocalized(row.name),
      isVisible: row.isVisible,
    })),
  }

  return <LocationsForm initial={draft} />
}
