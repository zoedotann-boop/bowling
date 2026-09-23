import { getLocale, getTranslations } from "next-intl/server"

import { AdminCard } from "@/components/admin/admin-ui"
import { requireLocationAccess } from "@/lib/admin/access"
import { getLeads } from "@/lib/db/queries/admin"
import { formatPrice } from "@/lib/localized"
import type { Locale } from "@/lib/locales"

// Read-only inbox of public event-form submissions for this location.
export default async function LeadsPage({
  params,
}: {
  params: Promise<{ location: string }>
}) {
  const { location: slug } = await params
  const { location: loc } = await requireLocationAccess(slug, "leads")
  const leads = await getLeads(loc.id)
  const t = await getTranslations("admin.leads")
  const locale = (await getLocale()) as Locale

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "he" ? "he-IL" : "en-US",
    { dateStyle: "medium", timeStyle: "short" }
  )

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">{t("title")}</h1>
      <AdminCard>
        {leads.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted-foreground">
                <th className="py-1.5 pe-2 text-start font-medium">
                  {t("date")}
                </th>
                <th className="py-1.5 pe-2 text-start font-medium">
                  {t("name")}
                </th>
                <th className="py-1.5 pe-2 text-start font-medium">
                  {t("contact")}
                </th>
                <th className="py-1.5 pe-2 text-start font-medium">
                  {t("total")}
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/60">
                  <td className="py-1.5 pe-2 align-top whitespace-nowrap">
                    {dateFormatter.format(lead.createdAt)}
                  </td>
                  <td className="py-1.5 pe-2 align-top">
                    {[lead.firstName, lead.lastName]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </td>
                  <td className="py-1.5 pe-2 align-top" dir="ltr">
                    <div>{lead.email ?? "—"}</div>
                    <div className="text-muted-foreground">
                      {lead.phone ?? ""}
                    </div>
                  </td>
                  <td className="py-1.5 pe-2 align-top whitespace-nowrap">
                    {lead.totalAmount === null
                      ? "—"
                      : formatPrice(lead.totalAmount, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </div>
  )
}
