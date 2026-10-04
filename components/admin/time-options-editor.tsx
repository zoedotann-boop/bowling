"use client"

import { Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

import { AdminInput } from "./admin-ui"
import { InfoTooltip } from "./info-tooltip"

export function TimeOptionsEditor({
  times,
  onChange,
}: {
  times: string[]
  onChange: (times: string[]) => void
}) {
  const t = useTranslations("admin.events")

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
        {t("timeOptions")}
        <InfoTooltip text={t("timeOptionsTip")} />
      </legend>
      {times.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("timeOptionsEmpty")}</p>
      )}
      <ul className="flex flex-wrap gap-2">
        {times.map((time, index) => (
          <li
            key={index}
            className="flex items-center rounded-md border border-border bg-background"
          >
            <AdminInput
              type="time"
              aria-label={t("timeOption", { number: index + 1 })}
              dir="ltr"
              className="h-9 w-28 border-0 tabular-nums scheme-dark"
              value={time}
              onChange={(event) =>
                onChange(
                  times.map((current, i) =>
                    i === index ? event.target.value : current
                  )
                )
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("removeTime", { time: time || index + 1 })}
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onChange(times.filter((_, i) => i !== index))}
            >
              <X />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...times, ""])}
      >
        <Plus />
        {t("addTime")}
      </Button>
    </fieldset>
  )
}
