"use client"

import { useLocale, useTranslations } from "next-intl"

import { AdminInput, AdminToggle } from "@/components/admin/admin-ui"
import type { GeneralDraft } from "@/lib/actions/admin/schemas"
import type { Locale } from "@/lib/locales"

type DayHours = GeneralDraft["hours"][number]

function weekdayLabel(
  day: number,
  locale: Locale,
  weekday: "long" | "short"
): string {
  const date = new Date(Date.UTC(2024, 0, 7 + day))
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    weekday,
    timeZone: "UTC",
  }).format(date)
}

const timeInputClass =
  "h-8 w-[3.75rem] px-1.5 tabular-nums scheme-dark sm:w-28 sm:px-2 max-sm:[&::-webkit-calendar-picker-indicator]:hidden"

export function HoursEditor({
  value,
  onChange,
}: {
  value: DayHours[]
  onChange: (value: DayHours[]) => void
}) {
  const t = useTranslations("admin.general")
  const locale = useLocale() as Locale

  function update(day: number, patch: Partial<DayHours>) {
    onChange(
      value.map((entry) => (entry.day === day ? { ...entry, ...patch } : entry))
    )
  }

  return (
    <ul className="divide-y divide-border rounded-md border border-border bg-background">
      {value.map((entry) => {
        const dayName = weekdayLabel(entry.day, locale, "long")
        return (
          <li
            key={entry.day}
            className="flex h-12 items-center gap-2 px-2 sm:gap-3 sm:px-3"
          >
            <span className="w-11 shrink-0 text-sm font-medium sm:w-24">
              <span className="sm:hidden">
                {weekdayLabel(entry.day, locale, "short")}
              </span>
              <span className="hidden sm:inline">{dayName}</span>
            </span>
            <AdminToggle
              aria-label={t("dayOpen", { day: dayName })}
              checked={!entry.closed}
              onCheckedChange={(open) => update(entry.day, { closed: !open })}
            />
            {entry.closed ? (
              <span className="text-sm text-muted-foreground">
                {t("closed")}
              </span>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <AdminInput
                  type="time"
                  aria-label={t("opensAt", { day: dayName })}
                  className={timeInputClass}
                  value={entry.open ?? ""}
                  onChange={(event) =>
                    update(entry.day, { open: event.target.value })
                  }
                />
                <span aria-hidden className="text-muted-foreground">
                  –
                </span>
                <AdminInput
                  type="time"
                  aria-label={t("closesAt", { day: dayName })}
                  className={timeInputClass}
                  value={entry.close ?? ""}
                  onChange={(event) =>
                    update(entry.day, { close: event.target.value })
                  }
                />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
