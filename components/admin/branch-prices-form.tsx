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
  deletePriceRowAction,
  reorderPriceRowsAction,
  savePriceRowAction,
} from "@/app/[locale]/admin/(protected)/_actions/prices"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { cn } from "@/lib/utils"

import { ConfirmDeleteDialog } from "./confirm-delete-dialog"
import { FieldLabelWithTooltip } from "./field-label-with-tooltip"
import { TranslatableInput } from "./translatable-input"
import { TranslationStateProvider } from "./translation-state-context"

const PRICE_KINDS = ["hourly", "adult", "child", "shoe"] as const
export type PriceKind = (typeof PRICE_KINDS)[number]

export type PriceRowForm = {
  id: string
  kind: PriceKind
  weekdayAmountCents: number
  weekendAmountCents: number
  sortOrder: number
  translations: Record<Locale, { label: string | null }>
  needsReview: string[]
  aiGeneratedLocales: Locale[]
}

type Props = {
  branchId: string
  slug: string
  initialRows: PriceRowForm[]
}

function localesValues(row: PriceRowForm): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {}
  for (const [locale, tr] of Object.entries(row.translations) as [
    Locale,
    PriceRowForm["translations"][Locale],
  ][]) {
    if (typeof tr.label === "string") out[locale] = tr.label
  }
  return out
}

function needsReviewLocalesFor(row: PriceRowForm): Locale[] {
  const locales: Locale[] = []
  for (const path of row.needsReview) {
    if (!path.startsWith("label.")) continue
    const suffix = path.slice("label.".length)
    if (suffix && !locales.includes(suffix as Locale)) {
      locales.push(suffix as Locale)
    }
  }
  return locales
}

export function BranchPricesForm({ branchId, slug, initialRows }: Props) {
  const t = useTranslations("Admin.prices")
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
    const result = await reorderPriceRowsAction(branchId, slug, payload)
    if (result.status === "success") {
      toast.success(tt("orderSaved"))
    } else {
      setRows(prev)
      toast.error(tt("genericError"))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-sm tracking-wide text-ink-muted uppercase">
          {t("title")}
        </h2>
        <NewPriceRowButton branchId={branchId} slug={slug} />
      </div>
      {rows.length === 0 ? (
        <div className="border border-line bg-surface p-6 text-center text-sm text-ink-muted">
          {t("empty")}
        </div>
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
            <ul className="flex flex-col gap-3">
              {rows.map((row) => (
                <SortableRow
                  key={row.id}
                  row={row}
                  branchId={branchId}
                  slug={slug}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function SortableRow({
  row,
  branchId,
  slug,
}: {
  row: PriceRowForm
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.prices")
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
      className={cn(
        "flex items-start gap-2 border border-line bg-surface p-3",
        isDragging && "opacity-60"
      )}
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
        <PriceRowFormFields row={row} branchId={branchId} slug={slug} />
      </div>
    </li>
  )
}

function PriceRowFormFields({
  row,
  branchId,
  slug,
}: {
  row: PriceRowForm
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.prices")
  const tTip = useTranslations("Admin.prices.tooltips")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const tTranslate = useTranslations("Admin.translate")
  const initialState: FormState<{ id: string }> = { status: "idle" }
  const [state, formAction, pending] = useActionState(
    savePriceRowAction,
    initialState
  )
  const [deletePending, startDelete] = React.useTransition()

  useEffect(() => {
    if (state.status === "success") toast.success(tt("priceSaved"))
    if (state.status === "error")
      toast.error(state.message ?? tt("genericError"))
  }, [state, tt])

  function handleDelete() {
    startDelete(async () => {
      const fd = new FormData()
      fd.set("id", row.id)
      fd.set("slug", slug)
      const result = await deletePriceRowAction(fd)
      if (result.status === "success") toast.success(tt("priceDeleted"))
      else toast.error(tt("genericError"))
    })
  }

  return (
    <TranslationStateProvider initialAiLocales={row.aiGeneratedLocales}>
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={row.id} />
        <input type="hidden" name="branchId" value={branchId} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="sortOrder" value={row.sortOrder} />
        <div className="grid gap-3 md:grid-cols-[8rem_8rem_8rem_1fr]">
          <Field>
            <FieldLabelWithTooltip tooltip={tTip("kind")}>
              {t("kind")}
            </FieldLabelWithTooltip>
            <select
              name="kind"
              defaultValue={row.kind}
              className="flex h-8 w-full rounded-none border border-border bg-background px-2.5 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
            >
              {PRICE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`kinds.${k}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabelWithTooltip tooltip={tTip("weekday")}>
              {t("weekday")}
            </FieldLabelWithTooltip>
            <Input
              name="weekdayAmountCents"
              type="number"
              min={0}
              step={1}
              defaultValue={row.weekdayAmountCents}
              required
            />
          </Field>
          <Field>
            <FieldLabelWithTooltip tooltip={tTip("weekend")}>
              {t("weekend")}
            </FieldLabelWithTooltip>
            <Input
              name="weekendAmountCents"
              type="number"
              min={0}
              step={1}
              defaultValue={row.weekendAmountCents}
              required
            />
          </Field>
          <TranslatableInput
            name="label"
            label={t("label")}
            tooltip={tTip("label")}
            defaultValues={localesValues(row)}
            needsReviewLocales={needsReviewLocalesFor(row)}
            aiLabel={tTranslate("fillField")}
            reviewLabel={tTranslate("fillField")}
          />
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
            description={t("confirmDeleteDescription")}
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

function NewPriceRowButton({
  branchId,
  slug,
}: {
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.prices")
  const tt = useTranslations("Admin.toasts")
  const [pending, startTransition] = React.useTransition()

  function handleAdd() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set("branchId", branchId)
      fd.set("slug", slug)
      fd.set("kind", "hourly")
      fd.set("weekdayAmountCents", "0")
      fd.set("weekendAmountCents", "0")
      const result = await savePriceRowAction({ status: "idle" }, fd)
      if (result.status === "success") toast.success(tt("priceCreated"))
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
