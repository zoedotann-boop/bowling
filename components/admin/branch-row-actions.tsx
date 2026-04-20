"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  deleteBranchAction,
  setBranchPublishedAction,
} from "@/app/[locale]/admin/(protected)/_actions/branches"

import { ConfirmDeleteDialog } from "./confirm-delete-dialog"

export function BranchRowActions({
  id,
  slug,
  published,
}: {
  id: string
  slug: string
  published: boolean
}) {
  const t = useTranslations("Admin.branches.list")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const [isPending, startTransition] = React.useTransition()

  function handleTogglePublished(next: boolean) {
    startTransition(async () => {
      const fd = new FormData()
      fd.set("id", id)
      fd.set("published", next ? "true" : "false")
      const result = await setBranchPublishedAction(fd)
      if (result.status === "success") {
        toast.success(next ? tt("branchPublished") : tt("branchUnpublished"))
      } else {
        toast.error(tt("genericError"))
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set("id", id)
      const result = await deleteBranchAction(fd)
      if (result.status === "success") {
        toast.success(tt("branchDeleted"))
      } else {
        toast.error(tt("genericError"))
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={published}
        onCheckedChange={handleTogglePublished}
        disabled={isPending}
        aria-label={t("togglePublished")}
      />
      <Button
        render={
          <Link href={`/admin/branches/${slug}`} aria-label={t("edit")}>
            <IconPencil />
          </Link>
        }
        variant="ghost"
        size="icon-sm"
      />
      <ConfirmDeleteDialog
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("delete")}
          >
            <IconTrash />
          </Button>
        }
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteDescription")}
        cancelLabel={tc("cancel")}
        confirmLabel={tc("delete")}
        pending={isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
