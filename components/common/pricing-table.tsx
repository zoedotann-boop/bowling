import { getLocale, getTranslations } from "next-intl/server"
import type { Branch } from "@/lib/branches"

export async function PricingTable({
  branch,
  rows,
  showHeaderLabel = true,
}: {
  branch: Branch
  rows?: Branch["prices"]
  showHeaderLabel?: boolean
}) {
  const t = await getTranslations("Pricing")
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const data = rows ?? branch.prices

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
      <div className="grid grid-cols-3 border-b border-line bg-surface-muted px-5 py-4 text-[11px] font-medium tracking-[0.16em] text-ink-muted uppercase sm:px-7">
        <span>{showHeaderLabel ? t("tableLabel") : ""}</span>
        <span className="text-end">{t("weekday")}</span>
        <span className="text-end">{t("weekend")}</span>
      </div>
      <div className="divide-y divide-line">
        {data.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-3 items-center gap-2 px-5 py-5 sm:px-7"
          >
            <span className="text-sm font-medium text-ink sm:text-base">
              {row.label[locale]}
            </span>
            <span className="text-end font-mono text-sm text-ink-soft sm:text-base">
              {row.weekday}
            </span>
            <span className="text-end font-mono text-sm font-medium text-ink sm:text-base">
              {row.weekend}
            </span>
          </div>
        ))}
        <div className="grid grid-cols-3 items-center gap-2 bg-surface-muted/40 px-5 py-4 sm:px-7">
          <span className="text-sm text-ink-muted">{t("shoeRental")}</span>
          <span className="text-end font-mono text-sm text-ink-soft">
            {branch.shoeRental.weekday}
          </span>
          <span className="text-end font-mono text-sm text-ink">
            {branch.shoeRental.weekend}
          </span>
        </div>
      </div>
    </div>
  )
}
