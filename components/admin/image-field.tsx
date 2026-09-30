"use client"

import { upload } from "@vercel/blob/client"
import { ImageIcon, LoaderCircle, Upload, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { IMAGE_UPLOAD_ROUTE, IMAGE_UPLOAD_TYPES } from "@/lib/images"

import { AdminField, AdminInput } from "./admin-ui"

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
  const t = useTranslations("admin.common")
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [failed, setFailed] = useState(false)

  async function uploadFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    setFailed(false)
    try {
      const blob = await upload(`admin/${file.name}`, file, {
        access: "public",
        handleUploadUrl: IMAGE_UPLOAD_ROUTE,
        contentType: file.type,
      })
      onChange(blob.url)
    } catch {
      setFailed(true)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <AdminField label={label} tooltip={tooltip} htmlFor={inputId}>
      <div className="flex items-center gap-3">
        {value ? (
          <div
            className="size-16 shrink-0 rounded-md border border-border bg-cover bg-center"
            style={{ backgroundImage: `url(${JSON.stringify(value)})` }}
            role="img"
            aria-label={label}
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
            <ImageIcon className="size-5" />
          </div>
        )}
        <AdminInput
          id={inputId}
          dir="ltr"
          value={value}
          placeholder={placeholder}
          aria-label={t("imageUrl")}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_UPLOAD_TYPES.join(",")}
          className="hidden"
          onChange={(event) => uploadFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <LoaderCircle className="animate-spin" /> : <Upload />}
          {uploading ? t("uploading") : t("upload")}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("removeImage")}
            onClick={() => onChange("")}
          >
            <X />
          </Button>
        )}
      </div>
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          {t("uploadError")}
        </p>
      )}
    </AdminField>
  )
}
