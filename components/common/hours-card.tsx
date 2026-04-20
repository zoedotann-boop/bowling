import { getLocale, getTranslations } from "next-intl/server"
import { IconClock } from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"

export async function HoursCard({ branch }: { branch: Branch }) {
  const t = await getTranslations("Contact")
  const locale = (await getLocale()) as keyof Branch["displayName"]

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
      <div className="flex items-center gap-2 text-ink-muted">
        <IconClock className="size-5" aria-hidden />
        <span className="text-[11px] font-medium tracking-[0.16em] uppercase">
          {t("hours")}
        </span>
      </div>
      <ul className="mt-5 space-y-1">
        {branch.hours.map((h, i) => (
          <li
            key={i}
            className="flex items-center justify-between border-b border-line py-3 last:border-0"
          >
            <span className="text-sm font-medium text-ink">
              {h.day[locale]}
            </span>
            <span className="font-mono text-sm text-ink-soft">
              {h.open} – {h.close}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
