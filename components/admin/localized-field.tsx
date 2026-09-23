"use client"

import type { Localized } from "@/lib/db/schema/_shared"

import { AdminField, AdminInput, AdminTextarea } from "./admin-ui"
import { useSectionContext } from "./section-form"

// Edits a single locale slice of a Localized value — the active locale comes
// from the SectionForm language toggle. Hebrew is the source language; leaving
// a translation blank falls back to Hebrew on the public site.
export function LocalizedField({
  label,
  tooltip,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string
  tooltip?: string
  value: Localized
  onChange: (value: Localized) => void
  multiline?: boolean
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
