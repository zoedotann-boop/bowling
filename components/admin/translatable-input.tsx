"use client"

import * as React from "react"

import { routing, type Locale, dirFromLocale } from "@/i18n/routing"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { AiSparkleButton } from "./ai-sparkle-button"
import { useTranslatableField } from "./translation-state-context"

export type TranslatableValues = Partial<Record<Locale, string>>

export function TranslatableInput({
  name,
  label,
  defaultValues,
  needsReviewLocales,
  required,
  aiLabel,
  reviewLabel,
  inputClassName,
}: {
  name: string
  label: string
  defaultValues?: TranslatableValues
  needsReviewLocales?: Locale[]
  required?: boolean
  aiLabel: string
  reviewLabel: string
  inputClassName?: string
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
        <FieldLabel>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </FieldLabel>
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
            <Input
              name={`${name}.${l}`}
              value={values[l] ?? ""}
              onChange={(e) => setValue(l, e.target.value)}
              dir={dirFromLocale(l)}
              lang={l}
              className={cn(inputClassName)}
            />
          </TabsPanel>
        ))}
      </Tabs>
    </Field>
  )
}
