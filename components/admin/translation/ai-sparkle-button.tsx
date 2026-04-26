"use client"

import * as React from "react"
import { IconLoader2, IconSparkles } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { routing, type Locale } from "@/i18n/routing"
import { translateBranchFieldsAction } from "@/app/[locale]/admin/(protected)/_actions/translate"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useTranslationState } from "./translation-state-context"

export function AiSparkleButton({
  fieldName,
  label,
  domainHint,
}: {
  fieldName: string
  label: string
  domainHint?: string
}) {
  const t = useTranslations("Admin.translate")
  const ctx = useTranslationState()
  const snapshot = React.useSyncExternalStore(ctx.subscribe, ctx.getSnapshot)
  const [pending, startTransition] = React.useTransition()

  const field = snapshot.fields.get(fieldName)
  const sourceValue = field?.values[ctx.sourceLocale] ?? ""
  const disabled = pending || sourceValue.trim().length === 0

  const handleClick = () => {
    const trimmed = sourceValue.trim()
    if (trimmed.length === 0) {
      toast.error(t("emptySource"))
      return
    }
    const targets = routing.locales.filter((l) => l !== ctx.sourceLocale)
    startTransition(async () => {
      const result = await translateBranchFieldsAction({
        sourceLocale: "he",
        targets,
        fields: { [fieldName]: trimmed },
        domainHint,
      })
      if (result.status === "success" && result.data) {
        const merged: Record<string, Partial<Record<Locale, string>>> = {
          [fieldName]: {},
        }
        for (const [locale, perField] of Object.entries(
          result.data.translations
        ) as [Locale, Record<string, string>][]) {
          const v = perField[fieldName]
          if (typeof v === "string") merged[fieldName][locale] = v
        }
        ctx.setAiValues(merged)
        return
      }
      const msg = result.status === "error" ? result.message : undefined
      if (msg === "rate_limit") toast.error(t("rateLimit"))
      else if (msg === "too_many_fields") toast.error(t("tooManyFields"))
      else if (msg === "empty_source") toast.error(t("emptySource"))
      else toast.error(t("gatewayError"))
    })
  }

  const tooltip = pending ? t("translating") : label

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={disabled}
            aria-label={tooltip}
            onClick={handleClick}
          >
            {pending ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <IconSparkles />
            )}
          </Button>
        }
      />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
