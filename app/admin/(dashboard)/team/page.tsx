import { getLocale, getTranslations } from "next-intl/server"

import { AdminCard } from "@/components/admin/admin-ui"
import { requireOwnerAccess } from "@/lib/admin/access"
import { listTeam } from "@/lib/db/queries/admin"
import { pickLocale } from "@/lib/localized"
import type { Locale } from "@/lib/locales"

// Owner-only overview of admin users, their role, and location memberships.
// Provisioning new users (email + password) is done via the seed script /
// Better Auth — there is no public signup.
export default async function TeamPage() {
  await requireOwnerAccess()
  const team = await listTeam()
  const t = await getTranslations("admin.team")
  const locale = (await getLocale()) as Locale

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("provisioningNote")}</p>
      <AdminCard>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-start text-xs text-muted-foreground">
              <th className="py-1.5 pe-2 text-start font-medium">
                {t("name")}
              </th>
              <th className="py-1.5 pe-2 text-start font-medium">
                {t("email")}
              </th>
              <th className="py-1.5 pe-2 text-start font-medium">
                {t("role")}
              </th>
              <th className="py-1.5 pe-2 text-start font-medium">
                {t("locations")}
              </th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member.id} className="border-b border-border/60">
                <td className="py-1.5 pe-2">{member.name}</td>
                <td className="py-1.5 pe-2" dir="ltr">
                  {member.email}
                </td>
                <td className="py-1.5 pe-2">{t(`roles.${member.role}`)}</td>
                <td className="py-1.5 pe-2">
                  {member.role === "owner"
                    ? t("allLocations")
                    : member.memberships
                        .map((entry) => pickLocale(entry.location.name, locale))
                        .join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
    </div>
  )
}
