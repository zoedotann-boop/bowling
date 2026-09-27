"use client"

import type { Localized } from "@/lib/db/schema/_shared"

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
  const { locale } = useSectionContext()
  const current = value[locale] ?? ""
  const dir = locale === "he" ? "rtl" : "ltr"

  function handleChange(next: string) {
    onChange({ ...value, [locale]: next })
  }

  return (
    <AdminField label={label} tooltip={tooltip}>
      {multiline ? (
        <AdminTextarea
          dir={dir}
          rows={rows}
          value={current}
          placeholder={placeholder}
          onChange={(event) => handleChange(event.target.value)}
        />
      ) : (
        <AdminInput
          dir={dir}
          value={current}
          placeholder={placeholder}
          onChange={(event) => handleChange(event.target.value)}
        />
      )}
    </AdminField>
  )
}
