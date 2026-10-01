"use client"

import { useTranslations } from "next-intl"
import { useId } from "react"

import { SERVICE_ART } from "@/components/home/service-art"
import { SERVICE_ICONS, type ServiceIcon } from "@/lib/home"

import { InfoTooltip } from "./info-tooltip"

export function ServiceArtPicker({
  label,
  tooltip,
  value,
  onChange,
}: {
  label: string
  tooltip?: string
  value: string
  onChange: (icon: ServiceIcon) => void
}) {
  const t = useTranslations("admin.home.serviceArtOption")
  const name = useId()

  return (
    <fieldset className="space-y-1.5">
      <legend className="flex items-center gap-1.5 text-sm font-medium">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {SERVICE_ICONS.map((icon) => {
          const Art = SERVICE_ART[icon]
          return (
            <label
              key={icon}
              className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-border bg-background p-2 text-center text-xs text-muted-foreground transition-colors hover:border-ring has-checked:border-primary has-checked:bg-primary/10 has-checked:text-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/40"
            >
              <input
                type="radio"
                name={name}
                value={icon}
                checked={value === icon}
                onChange={() => onChange(icon)}
                className="sr-only"
              />
              <Art className="h-10 w-auto" />
              {t(icon)}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
