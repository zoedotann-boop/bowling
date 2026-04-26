"use client"

import * as React from "react"
import { useActionState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { IconGripVertical, IconPlus, IconTrash } from "@tabler/icons-react"
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"

import type { Locale } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  deletePackageAction,
  reorderPackagesAction,
  savePackageAction,
} from "@/app/[locale]/admin/(protected)/_actions/packages"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { cn } from "@/lib/utils"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog"
import { FieldLabelWithTooltip } from "../shared/field-label-with-tooltip"
import { TranslatableField } from "../translation/translatable-field"
import { TranslationStateProvider } from "../translation/translation-state-context"

export type PackageFormRow = {
  id: string
  amountCents: number
  sortOrder: number
  translations: Record<Locale, { title: string | null; perks: string | null }>
  needsReview: string[]
  aiGeneratedLocales: Locale[]
}

type Props = {
  branchId: string
  slug: string
  initialRows: PackageFormRow[]
}

function localesValues<K extends "title" | "perks">(
  row: PackageFormRow,
  field: K
): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {}
  for (const [locale, tr] of Object.entries(row.translations) as [
    Locale,
    PackageFormRow["translations"][Locale],
  ][]) {
    const value = tr[field]
    if (typeof value === "string") out[locale] = value
  }
  return out
}

function needsReviewLocalesFor(row: PackageFormRow, prefix: string): Locale[] {
  const locales: Locale[] = []
  for (const path of row.needsReview) {
    if (!path.startsWith(`${prefix}.`)) continue
    const suffix = path.slice(prefix.length + 1)
    if (suffix && !locales.includes(suffix as Locale)) {
      locales.push(suffix as Locale)
    }
  }
  return locales
}

export function BranchPackagesForm({ branchId, slug, initialRows }: Props) {
  const t = useTranslations("Admin.packages")
  const tt = useTranslations("Admin.toasts")
  const [rows, setRows] = React.useState(initialRows)
  const [prevInitial, setPrevInitial] = React.useState(initialRows)
  if (initialRows !== prevInitial) {
    setPrevInitial(initialRows)
    setRows(initialRows)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = rows.findIndex((r) => r.id === active.id)
    const newIndex = rows.findIndex((r) => r.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const prev = rows
    const next = arrayMove(rows, oldIndex, newIndex)
    setRows(next)

    const payload = next.map((r, idx) => ({ id: r.id, sortOrder: idx }))
    const result = await reorderPackagesAction(branchId, slug, payload)
    if (result.status === "success") {
      toast.success(tt("orderSaved"))
    } else {
      setRows(prev)
      toast.error(tt("genericError"))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardAction>
          <NewPackageButton branchId={branchId} slug={slug} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">
            {t("empty")}
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rows.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col">
                {rows.map((row, idx) => (
                  <React.Fragment key={row.id}>
                    {idx > 0 ? <Separator className="my-3" /> : null}
                    <SortableRow row={row} branchId={branchId} slug={slug} />
                  </React.Fragment>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  )
}

function SortableRow({
  row,
  branchId,
  slug,
}: {
  row: PackageFormRow
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.packages")
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-start gap-2", isDragging && "opacity-60")}
    >
      <button
        type="button"
        className="mt-1 flex size-6 shrink-0 cursor-grab items-center justify-center text-ink-muted hover:text-ink focus-visible:outline-none"
        aria-label={t("reorder")}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-4" />
      </button>
      <div className="flex-1">
        <PackageRowForm row={row} branchId={branchId} slug={slug} />
      </div>
    </li>
  )
}

function PackageRowForm({
  row,
  branchId,
  slug,
}: {
  row: PackageFormRow
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.packages")
  const tTip = useTranslations("Admin.packages.tooltips")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const tTranslate = useTranslations("Admin.translate")
  const initialState: FormState<{ id: string }> = { status: "idle" }
  const [state, formAction, pending] = useActionState(
    savePackageAction,
    initialState
  )
  const [deletePending, startDelete] = React.useTransition()

  useEffect(() => {
    if (state.status === "success") toast.success(tt("packageSaved"))
    if (state.status === "error")
      toast.error(state.message ?? tt("genericError"))
  }, [state, tt])

  function handleDelete() {
    startDelete(async () => {
      const fd = new FormData()
      fd.set("id", row.id)
      fd.set("slug", slug)
      const result = await deletePackageAction(fd)
      if (result.status === "success") toast.success(tt("packageDeleted"))
      else toast.error(tt("genericError"))
    })
  }

  const amount = (row.amountCents / 100).toFixed(2)

  return (
    <TranslationStateProvider initialAiLocales={row.aiGeneratedLocales}>
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={row.id} />
        <input type="hidden" name="branchId" value={branchId} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="sortOrder" value={row.sortOrder} />
        <div className="grid gap-3 md:grid-cols-[10rem_1fr]">
          <Field>
            <FieldLabelWithTooltip tooltip={tTip("amount")}>
              {t("amount")}
            </FieldLabelWithTooltip>
            <Input
              name="amountCents"
              type="number"
              min={0}
              step={1}
              defaultValue={row.amountCents}
              required
            />
          </Field>
          <div className="flex flex-col gap-3">
            <TranslatableField
              name="title"
              label={t("titleLabel")}
              tooltip={tTip("titleLabel")}
              defaultValues={localesValues(row, "title")}
              needsReviewLocales={needsReviewLocalesFor(row, "title")}
              aiLabel={tTranslate("fillField")}
              reviewLabel={tTranslate("fillField")}
            />
            <TranslatableField
              as="textarea"
              name="perks"
              label={t("perks")}
              tooltip={tTip("perks")}
              defaultValues={localesValues(row, "perks")}
              needsReviewLocales={needsReviewLocalesFor(row, "perks")}
              rows={2}
              aiLabel={tTranslate("fillField")}
              reviewLabel={tTranslate("fillField")}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <ConfirmDeleteDialog
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deletePending}
              >
                <IconTrash className="size-3.5" />
                {tc("delete")}
              </Button>
            }
            title={t("confirmDeleteTitle")}
            description={t("confirmDeleteDescription", { amount })}
            cancelLabel={tc("cancel")}
            confirmLabel={tc("delete")}
            onConfirm={handleDelete}
            pending={deletePending}
          />
          <Button type="submit" size="sm" disabled={pending}>
            {tc("save")}
          </Button>
        </div>
      </form>
    </TranslationStateProvider>
  )
}

function NewPackageButton({
  branchId,
  slug,
}: {
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.packages")
  const tt = useTranslations("Admin.toasts")
  const [pending, startTransition] = React.useTransition()

  function handleAdd() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set("branchId", branchId)
      fd.set("slug", slug)
      fd.set("amountCents", "0")
      const result = await savePackageAction({ status: "idle" }, fd)
      if (result.status === "success") toast.success(tt("packageCreated"))
      else toast.error(tt("genericError"))
    })
  }

  return (
    <Button type="button" size="sm" onClick={handleAdd} disabled={pending}>
      <IconPlus className="size-3.5" />
      {t("add")}
    </Button>
  )
}
