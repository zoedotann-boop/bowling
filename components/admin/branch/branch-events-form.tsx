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
import {
  deleteEventAction,
  reorderEventsAction,
  saveEventAction,
} from "@/app/[locale]/admin/(protected)/_actions/events"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { cn } from "@/lib/utils"

import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog"
import { MediaPicker, type MediaPickerValue } from "../media/media-picker"
import { TranslatableField } from "../translation/translatable-field"
import { TranslationStateProvider } from "../translation/translation-state-context"

export type EventFormRow = {
  id: string
  image: MediaPickerValue
  sortOrder: number
  translations: Record<
    Locale,
    { title: string | null; description: string | null }
  >
  needsReview: string[]
  aiGeneratedLocales: Locale[]
}

type Props = {
  branchId: string
  slug: string
  initialRows: EventFormRow[]
}

function localesValues<K extends "title" | "description">(
  row: EventFormRow,
  field: K
): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {}
  for (const [locale, tr] of Object.entries(row.translations) as [
    Locale,
    EventFormRow["translations"][Locale],
  ][]) {
    const value = tr[field]
    if (typeof value === "string") out[locale] = value
  }
  return out
}

function needsReviewLocalesFor(row: EventFormRow, prefix: string): Locale[] {
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

export function BranchEventsForm({ branchId, slug, initialRows }: Props) {
  const t = useTranslations("Admin.events")
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
    const result = await reorderEventsAction(branchId, slug, payload)
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
        <NewEventButton branchId={branchId} slug={slug} />
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
  row: EventFormRow
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.events")
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
        <EventRowForm row={row} branchId={branchId} slug={slug} />
      </div>
    </li>
  )
}

function EventRowForm({
  row,
  branchId,
  slug,
}: {
  row: EventFormRow
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.events")
  const tTip = useTranslations("Admin.events.tooltips")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const tTranslate = useTranslations("Admin.translate")
  const initialState: FormState<{ id: string }> = { status: "idle" }
  const [state, formAction, pending] = useActionState(
    saveEventAction,
    initialState
  )
  const [deletePending, startDelete] = React.useTransition()

  useEffect(() => {
    if (state.status === "success") toast.success(tt("eventSaved"))
    if (state.status === "error")
      toast.error(state.message ?? tt("genericError"))
  }, [state, tt])

  function handleDelete() {
    startDelete(async () => {
      const fd = new FormData()
      fd.set("id", row.id)
      fd.set("slug", slug)
      const result = await deleteEventAction(fd)
      if (result.status === "success") toast.success(tt("eventDeleted"))
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
        <div className="grid gap-3 md:grid-cols-[14rem_1fr]">
          <MediaPicker
            name="imageId"
            label={t("image")}
            tooltip={tTip("image")}
            initial={row.image}
            branchId={branchId}
          />
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
              name="description"
              label={t("description")}
              tooltip={tTip("description")}
              defaultValues={localesValues(row, "description")}
              needsReviewLocales={needsReviewLocalesFor(row, "description")}
              rows={3}
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

function NewEventButton({
  branchId,
  slug,
}: {
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.events")
  const tt = useTranslations("Admin.toasts")
  const [pending, startTransition] = React.useTransition()

  function handleAdd() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set("branchId", branchId)
      fd.set("slug", slug)
      const result = await saveEventAction({ status: "idle" }, fd)
      if (result.status === "success") toast.success(tt("eventCreated"))
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
