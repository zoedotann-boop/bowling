"use client"

import * as React from "react"

import { routing, type Locale, dirFromLocale } from "@/i18n/routing"
import { Field } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { AiSparkleButton } from "./ai-sparkle-button"
import { FieldLabelWithTooltip } from "./field-label-with-tooltip"
import type { TranslatableValues } from "./translatable-input"
import { useTranslatableField } from "./translation-state-context"

export function TranslatableTextarea({
  name,
  label,
  tooltip,
  defaultValues,
  needsReviewLocales,
  required,
  aiLabel,
  reviewLabel,
  rows,
  textareaClassName,
}: {
  name: string
  label: string
  tooltip?: string
  defaultValues?: TranslatableValues
  needsReviewLocales?: Locale[]
  required?: boolean
  aiLabel: string
  reviewLabel: string
  rows?: number
  textareaClassName?: string
}) {
  const locales = routing.locales
  const aiInit = (needsReviewLocales?.length ?? 0) > 0
  const { values, setValue } = useTranslatableField(
    name,
    defaultValues ?? {},
    aiInit
  )
  const [active, setActive] = React.useState<Locale>(routing.defaultLocale)
  const reviewSet = new Set(needsReviewLocales ?? [])

  return (
    <Field>
      <div className="flex items-center justify-between gap-2">
        <FieldLabelWithTooltip tooltip={tooltip} required={required}>
          {label}
        </FieldLabelWithTooltip>
        <AiSparkleButton fieldName={name} label={aiLabel} />
      </div>
      <Tabs value={active} onValueChange={(v) => setActive(v as Locale)}>
        <TabsList>
          {locales.map((l) => (
            <TabsTab key={l} value={l} className="gap-1.5">
              <span className="uppercase">{l}</span>
              {reviewSet.has(l) ? (
                <span
                  aria-label={reviewLabel}
                  title={reviewLabel}
                  className="size-1.5 rounded-full bg-accent"
                />
              ) : null}
            </TabsTab>
          ))}
        </TabsList>
        {locales.map((l) => (
          <TabsPanel key={l} value={l} className="gap-1.5">
            <Textarea
              name={`${name}.${l}`}
              value={values[l] ?? ""}
              onChange={(e) => setValue(l, e.target.value)}
              rows={rows}
              dir={dirFromLocale(l)}
              lang={l}
              className={cn(textareaClassName)}
            />
          </TabsPanel>
        ))}
      </Tabs>
    </Field>
  )
}
