"use client"

import { useTranslations } from "next-intl"
import { useId } from "react"

import type { Localized } from "@/lib/db/schema/_shared"
import { isMissingEnglish } from "@/lib/localized"

import { AdminField, AdminInput, AdminTextarea } from "./admin-ui"
import { useSectionContext } from "./section-form"

export function LocalizedField({
  label,
  tooltip,
  value,
  onChange,
  multiline,
  rows,
  placeholder,
}: {
  label: string
  tooltip?: string
  value: Localized
  onChange: (value: Localized) => void
  multiline?: boolean
  rows?: number
  placeholder?: string
}) {
  const t = useTranslations("admin.common")
  const hintId = useId()
  const { locale } = useSectionContext()
  const current = value[locale] ?? ""
  const dir = locale === "he" ? "rtl" : "ltr"
  const missingEnglish = isMissingEnglish(value)
  const control = {
    dir,
    value: current,
    placeholder: locale === "en" && missingEnglish ? value.he : placeholder,
    "aria-describedby": missingEnglish ? hintId : undefined,
  }

  function handleChange(next: string) {
    onChange({ ...value, [locale]: next })
  }

  return (
    <AdminField label={label} tooltip={tooltip}>
      {multiline ? (
        <AdminTextarea
          {...control}
          rows={rows}
          onChange={(event) => handleChange(event.target.value)}
        />
      ) : (
        <AdminInput
          {...control}
          onChange={(event) => handleChange(event.target.value)}
        />
      )}
      {missingEnglish && (
        <p id={hintId} className="text-xs text-destructive">
          {t("missingEnglish")}
        </p>
      )}
    </AdminField>
  )
}
