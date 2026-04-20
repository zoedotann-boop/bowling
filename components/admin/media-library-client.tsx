"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { IconTrash, IconUpload } from "@tabler/icons-react"
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
import { Textarea } from "@/components/ui/textarea"
import { uploadMedia } from "@/lib/admin/upload-media"
import type { MediaAssetRead } from "@/lib/services/media"
import {
  deleteMediaAction,
  updateMediaAltTextAction,
} from "@/app/[locale]/admin/(protected)/_actions/media"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"

const LOCALE_KEYS = [
  { key: "altTextHe", locale: "he" },
  { key: "altTextEn", locale: "en" },
  { key: "altTextRu", locale: "ru" },
  { key: "altTextAr", locale: "ar" },
] as const

export function MediaLibraryClient({ items }: { items: MediaAssetRead[] }) {
  const t = useTranslations("Admin.media")
  const [selected, setSelected] = React.useState<MediaAssetRead | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <UploadButton />
      </header>
      {items.length === 0 ? (
        <div className="border border-line bg-surface p-6 text-center text-sm text-ink-muted">
          {t("empty")}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="group relative block aspect-square w-full overflow-hidden border border-line bg-muted/40 transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
              >
                <Image
                  src={item.blobUrl}
                  alt={item.altTextEn ?? item.filename ?? ""}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </button>
              <p className="mt-1 truncate font-mono text-xs text-ink-muted">
                {item.filename ?? item.id.slice(0, 8)}
              </p>
            </li>
          ))}
        </ul>
      )}
      <DetailDialog item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function UploadButton() {
  const t = useTranslations("Admin.media")
  const [open, setOpen] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" type="button">
            <IconUpload className="size-4" />
            {t("upload")}
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("upload")}</DialogTitle>
        </DialogHeader>
        <UploadForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function UploadForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations("Admin.media")
  const router = useRouter()
  const [file, setFile] = React.useState<File | null>(null)
  const [alt, setAlt] = React.useState({
    altTextHe: "",
    altTextEn: "",
    altTextRu: "",
    altTextAr: "",
  })
  const [pending, startTransition] = React.useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return
    startTransition(async () => {
      const result = await uploadMedia({ file, ...alt })
      if (result.ok) {
        toast.success(t("uploadSuccess"))
        router.refresh()
        onDone()
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
      {LOCALE_KEYS.map(({ key, locale }) => (
        <Field key={key}>
          <FieldLabel>{t("altTextLabel", { locale })}</FieldLabel>
          <Input
            value={alt[key]}
            onChange={(event) =>
              setAlt((prev) => ({ ...prev, [key]: event.target.value }))
            }
          />
        </Field>
      ))}
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

function DetailDialog({
  item,
  onClose,
}: {
  item: MediaAssetRead | null
  onClose: () => void
}) {
  const t = useTranslations("Admin.media")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const router = useRouter()
  const [isDeleting, startDelete] = React.useTransition()
  const initialState: FormState = { status: "idle" }
  const [state, formAction, savePending] = React.useActionState(
    updateMediaAltTextAction,
    initialState
  )

  React.useEffect(() => {
    if (state.status === "success") {
      toast.success(tt("mediaUpdated"))
      router.refresh()
      onClose()
    } else if (state.status === "error") {
      toast.error(tt("genericError"))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  if (!item) return null

  function handleDelete() {
    if (!item) return
    startDelete(async () => {
      const fd = new FormData()
      fd.set("id", item.id)
      const result = await deleteMediaAction(fd)
      if (result.status === "success") {
        toast.success(tt("mediaDeleted"))
        router.refresh()
        onClose()
      } else {
        toast.error(tt("genericError"))
      }
    })
  }

  return (
    <Dialog open={Boolean(item)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{item.filename ?? t("untitled")}</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden border border-line bg-muted/40">
          <Image
            src={item.blobUrl}
            alt={item.altTextEn ?? item.filename ?? ""}
            fill
            sizes="(min-width: 640px) 36rem, 100vw"
            className="object-contain"
          />
        </div>
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={item.id} />
          {LOCALE_KEYS.map(({ key, locale }) => (
            <Field key={key}>
              <FieldLabel>{t("altTextLabel", { locale })}</FieldLabel>
              <Textarea name={key} defaultValue={item[key] ?? ""} rows={2} />
            </Field>
          ))}
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              <IconTrash className="size-3.5" />
              {tc("delete")}
            </Button>
            <Button type="submit" size="sm" disabled={savePending}>
              {tc("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
