"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

export function InlineConfirm({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const t = useTranslations("admin.common")
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
    >
      <p className="text-sm">{message}</p>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}
