"use client"

import * as React from "react"

import { routing, type Locale, dirFromLocale } from "@/i18n/routing"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { FieldLabelWithTooltip } from "../shared/field-label-with-tooltip"

import { AiSparkleButton } from "./ai-sparkle-button"
import { useTranslatableField } from "./translation-state-context"

export type TranslatableValues = Partial<Record<Locale, string>>

type BaseProps = {
  name: string
  label: string
  tooltip?: string
  defaultValues?: TranslatableValues
  needsReviewLocales?: Locale[]
  required?: boolean
  aiLabel: string
  reviewLabel: string
  className?: string
}

type Props =
  | (BaseProps & { as?: "input" })
  | (BaseProps & { as: "textarea"; rows?: number })

export function TranslatableField(props: Props) {
  const {
    name,
    label,
    tooltip,
    defaultValues,
    needsReviewLocales,
    required,
    aiLabel,
    reviewLabel,
    className,
  } = props
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
        {locales.map((l) =>
          props.as === "textarea" ? (
            <TabsPanel key={l} value={l} className="gap-1.5">
              <Textarea
                name={`${name}.${l}`}
                value={values[l] ?? ""}
                onChange={(e) => setValue(l, e.target.value)}
                rows={props.rows}
                dir={dirFromLocale(l)}
                lang={l}
                className={cn(className)}
              />
            </TabsPanel>
          ) : (
            <TabsPanel key={l} value={l} className="gap-1.5">
              <Input
                name={`${name}.${l}`}
                value={values[l] ?? ""}
                onChange={(e) => setValue(l, e.target.value)}
                dir={dirFromLocale(l)}
                lang={l}
                className={cn(className)}
              />
            </TabsPanel>
          )
        )}
      </Tabs>
    </Field>
  )
}
