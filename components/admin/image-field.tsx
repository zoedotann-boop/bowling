"use client"

import { ImageIcon } from "lucide-react"

import { AdminField, AdminInput } from "./admin-ui"

// A URL-based image field with a small preview. Blank URLs are normalized to
// null by the save action before writing. (No blob upload wired yet — a URL is
// the source of truth.)
export function ImageField({
  label,
  tooltip,
  value,
  onChange,
  placeholder = "https://…",
}: {
  label: string
  tooltip?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <AdminField label={label} tooltip={tooltip}>
      <div className="flex items-center gap-3">
        {value ? (
          <div
            className="size-16 shrink-0 rounded-md border border-border bg-cover bg-center"
            style={{ backgroundImage: `url(${value})` }}
            role="img"
            aria-label={label}
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
            <ImageIcon className="size-5" />
          </div>
        )}
        <AdminInput
          dir="ltr"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </AdminField>
  )
}
