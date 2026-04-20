"use client"

import * as React from "react"
import { IconLoader2, IconSparkles } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { routing, type Locale } from "@/i18n/routing"
import { translateBranchFieldsAction } from "@/app/[locale]/admin/(protected)/_actions/translate"
import { Button } from "@/components/ui/button"

import { useTranslationState } from "./translation-state-context"

export function FillTranslationsButton({
  domainHint,
}: {
  domainHint?: string
}) {
  const t = useTranslations("Admin.translate")
  const ctx = useTranslationState()
  const [pending, startTransition] = React.useTransition()

  const handleClick = () => {
    const fields = ctx.getSourceFields()
    if (Object.keys(fields).length === 0) {
      toast.error(t("needSource"))
      return
    }
    const targets = routing.locales.filter((l) => l !== ctx.sourceLocale)
    startTransition(async () => {
      const result = await translateBranchFieldsAction({
        sourceLocale: "he",
        targets,
        fields,
        domainHint,
      })
      if (result.status === "success" && result.data) {
        const merged: Record<string, Partial<Record<Locale, string>>> = {}
        for (const [locale, perField] of Object.entries(
          result.data.translations
        ) as [Locale, Record<string, string>][]) {
          for (const [fieldName, value] of Object.entries(perField)) {
            if (!merged[fieldName]) merged[fieldName] = {}
            merged[fieldName][locale] = value
          }
        }
        ctx.setAiValues(merged)
        return
      }
      const msg = result.status === "error" ? result.message : undefined
      if (msg === "rate_limit") toast.error(t("rateLimit"))
      else if (msg === "too_many_fields") toast.error(t("tooManyFields"))
      else if (msg === "empty_source") toast.error(t("needSource"))
      else toast.error(t("gatewayError"))
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? <IconLoader2 className="animate-spin" /> : <IconSparkles />}
      {pending ? t("translating") : t("fillAll")}
    </Button>
  )
}
