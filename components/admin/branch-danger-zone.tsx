"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useRouter } from "@/i18n/navigation"
import { deleteBranchAction } from "@/app/[locale]/admin/(protected)/_actions/branches"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ConfirmDeleteDialog } from "./confirm-delete-dialog"

export function BranchDangerZone({ branchId }: { branchId: string }) {
  const t = useTranslations("Admin.branches.form")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  function handleDelete() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set("id", branchId)
      const result = await deleteBranchAction(fd)
      if (result.status === "success") {
        toast.success(tt("branchDeleted"))
        router.push("/admin/branches")
        router.refresh()
      } else {
        toast.error(tt("genericError"))
      }
    })
  }

  return (
    <Card className="ring-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">{t("dangerZone")}</CardTitle>
        <CardDescription>{t("dangerZoneDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ConfirmDeleteDialog
          trigger={
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={pending}
            >
              {tc("delete")}
            </Button>
          }
          title={t("confirmDeleteTitle")}
          description={t("confirmDeleteDescription")}
          cancelLabel={tc("cancel")}
          confirmLabel={tc("delete")}
          pending={pending}
          onConfirm={handleDelete}
        />
      </CardContent>
    </Card>
  )
}
