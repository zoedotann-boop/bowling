"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { uploadMedia } from "@/lib/admin/upload-media"
import type { MediaAssetRead } from "@/lib/services/media"

export type MediaPickerValue = {
  id: string
  blobUrl: string
  filename: string | null
} | null

export function MediaPicker({
  name,
  label,
  initial,
}: {
  name: string
  label: string
  initial: MediaPickerValue
}) {
  const t = useTranslations("Admin.media")
  const [value, setValue] = React.useState<MediaPickerValue>(initial)
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<MediaAssetRead[] | null>(null)

  const loadItems = React.useCallback(async () => {
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" })
      if (!response.ok) {
        toast.error(t("errors.loadFailed"))
        setItems([])
        return
      }
      const data = (await response.json()) as { items: MediaAssetRead[] }
      setItems(data.items)
    } catch {
      toast.error(t("errors.loadFailed"))
      setItems([])
    }
  }, [t])

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <input type="hidden" name={name} value={value?.id ?? ""} />
      <div className="flex items-center gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden border border-line bg-muted/40">
          {value ? (
            <Image
              src={value.blobUrl}
              alt={value.filename ?? ""}
              fill
              sizes="5rem"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-ink-muted">
              <IconPhoto className="size-6" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next)
              if (next) loadItems()
            }}
          >
            <DialogTrigger
              render={
                <Button type="button" variant="outline" size="sm">
                  {value ? t("picker.change") : t("picker.select")}
                </Button>
              }
            />
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{t("picker.title")}</DialogTitle>
              </DialogHeader>
              <PickerBody
                items={items}
                onUploaded={(asset) =>
                  setItems((prev) => (prev ? [asset, ...prev] : [asset]))
                }
                onSelect={(asset) => {
                  setValue({
                    id: asset.id,
                    blobUrl: asset.blobUrl,
                    filename: asset.filename,
                  })
                  setOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setValue(null)}
            >
              <IconX className="size-3" />
              {t("picker.clear")}
            </Button>
          ) : null}
          {value?.filename ? (
            <p className="truncate font-mono text-xs text-ink-muted">
              {value.filename}
            </p>
          ) : null}
        </div>
      </div>
    </Field>
  )
}

function PickerBody({
  items,
  onSelect,
  onUploaded,
}: {
  items: MediaAssetRead[] | null
  onSelect: (asset: MediaAssetRead) => void
  onUploaded: (asset: MediaAssetRead) => void
}) {
  const t = useTranslations("Admin.media")
  const [uploadOpen, setUploadOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger
            render={
              <Button type="button" size="sm">
                <IconUpload className="size-4" />
                {t("upload")}
              </Button>
            }
          />
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("upload")}</DialogTitle>
            </DialogHeader>
            <InlineUploadForm
              onUploaded={(asset) => {
                setUploadOpen(false)
                onUploaded(asset)
                onSelect(asset)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {items === null ? (
        <p className="p-6 text-center text-sm text-ink-muted">
          {t("picker.loading")}
        </p>
      ) : items.length === 0 ? (
        <p className="p-6 text-center text-sm text-ink-muted">
          {t("picker.empty")}
        </p>
      ) : (
        <ul className="grid max-h-96 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="group relative block aspect-square w-full overflow-hidden border border-line bg-muted/40 transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
              >
                <Image
                  src={item.blobUrl}
                  alt={item.altTextEn ?? item.filename ?? ""}
                  fill
                  sizes="(min-width: 640px) 12rem, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function InlineUploadForm({
  onUploaded,
}: {
  onUploaded: (asset: MediaAssetRead) => void
}) {
  const t = useTranslations("Admin.media")
  const [file, setFile] = React.useState<File | null>(null)
  const [pending, startTransition] = React.useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return
    startTransition(async () => {
      const result = await uploadMedia({ file })
      if (result.ok) {
        toast.success(t("uploadSuccess"))
        onUploaded(result.asset)
      } else {
        toast.error(translateUploadError(t, result.reason))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field>
        <FieldLabel>{t("file")}</FieldLabel>
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-ink-muted">{t("fileHint")}</p>
      </Field>
      <DialogFooter>
        <DialogClose
          render={
            <Button type="button" variant="outline" size="sm">
              {t("cancel")}
            </Button>
          }
        />
        <Button type="submit" size="sm" disabled={!file || pending}>
          {pending ? t("uploading") : t("upload")}
        </Button>
      </DialogFooter>
    </form>
  )
}

function translateUploadError(
  t: ReturnType<typeof useTranslations>,
  reason: string
): string {
  switch (reason) {
    case "tooLarge":
      return t("errors.tooLarge")
    case "badType":
      return t("errors.badType")
    case "empty":
      return t("errors.empty")
    case "forbidden":
      return t("errors.forbidden")
    default:
      return t("errors.uploadFailed")
  }
}
