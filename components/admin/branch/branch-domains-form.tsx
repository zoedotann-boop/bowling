"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import {
  createBranchDomainAction,
  deleteBranchDomainAction,
} from "@/app/[locale]/admin/(protected)/_actions/domains"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog"
import { FieldLabelWithTooltip } from "../shared/field-label-with-tooltip"

export type BranchDomainRow = {
  id: string
  host: string
}

export function BranchDomainsForm({
  branchId,
  initial,
}: {
  branchId: string
  initial: BranchDomainRow[]
}) {
  const t = useTranslations("Admin.domains")
  const [rows, setRows] = React.useState(initial)
  const [prev, setPrev] = React.useState(initial)
  if (initial !== prev) {
    setPrev(initial)
    setRows(initial)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        <CardAction>
          <NewDomainButton
            branchId={branchId}
            onCreated={(row) => setRows((current) => [...current, row])}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">
            {t("empty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((row) => (
              <DomainRow
                key={row.id}
                branchId={branchId}
                row={row}
                onRemoved={(id) =>
                  setRows((current) => current.filter((r) => r.id !== id))
                }
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function DomainRow({
  branchId,
  row,
  onRemoved,
}: {
  branchId: string
  row: BranchDomainRow
  onRemoved: (id: string) => void
}) {
  const t = useTranslations("Admin.domains")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const [pending, startTransition] = React.useTransition()

  function handleDelete() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set("id", row.id)
      fd.set("branchId", branchId)
      const result = await deleteBranchDomainAction(fd)
      if (result.status === "success") {
        toast.success(tt("domainDeleted"))
        onRemoved(row.id)
      } else {
        toast.error(tt("genericError"))
      }
    })
  }

  return (
    <li className="flex items-center justify-between border border-line bg-surface p-3">
      <span className="font-mono text-sm text-ink">{row.host}</span>
      <ConfirmDeleteDialog
        trigger={
          <Button type="button" variant="ghost" size="sm" disabled={pending}>
            <IconTrash className="size-3.5" />
            {tc("delete")}
          </Button>
        }
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteDescription", { host: row.host })}
        cancelLabel={tc("cancel")}
        confirmLabel={tc("delete")}
        onConfirm={handleDelete}
        pending={pending}
      />
    </li>
  )
}

function NewDomainButton({
  branchId,
  onCreated,
}: {
  branchId: string
  onCreated: (row: BranchDomainRow) => void
}) {
  const t = useTranslations("Admin.domains")
  const tTip = useTranslations("Admin.domains.tooltips")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const [open, setOpen] = React.useState(false)
  const [host, setHost] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const fd = new FormData()
      fd.set("branchId", branchId)
      fd.set("host", host)
      const result = await createBranchDomainAction({ status: "idle" }, fd)
      if (result.status === "success" && result.data) {
        toast.success(tt("domainCreated"))
        onCreated({ id: result.data.id, host: result.data.host })
        setOpen(false)
        setHost("")
      } else {
        const fieldErr =
          result.status === "error" && result.fieldErrors?.host?.[0]
        toast.error(fieldErr ?? tt("genericError"))
      }
    })
  }

  if (!open) {
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <IconPlus className="size-3.5" />
        {t("add")}
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 bg-surface"
    >
      <Field className="min-w-56 flex-1">
        <FieldLabelWithTooltip tooltip={tTip("host")}>
          {t("host")}
        </FieldLabelWithTooltip>
        <Input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="example.com"
          required
        />
      </Field>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false)
            setHost("")
          }}
        >
          {tc("cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {tc("save")}
        </Button>
      </div>
    </form>
  )
}
