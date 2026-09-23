import { AdminShell } from "@/components/admin/admin-shell"
import { listAccessibleLocations, requireAdminUser } from "@/lib/admin/access"

// The single auth gate for the whole dashboard. Everything below is protected;
// login lives outside this group.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdminUser()
  const locations = await listAccessibleLocations(user)

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role }}
      locations={locations.map((item) => ({
        slug: item.slug,
        name: item.name,
      }))}
    >
      {children}
    </AdminShell>
  )
}
