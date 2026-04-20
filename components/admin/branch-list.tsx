"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { IconGripVertical } from "@tabler/icons-react"
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

import { cn } from "@/lib/utils"
import { reorderBranchesAction } from "@/app/[locale]/admin/(protected)/_actions/branches"

import { BranchRowActions } from "./branch-row-actions"

export type BranchListItem = {
  id: string
  slug: string
  displayName: string
  published: boolean
}

function SortableRow({
  item,
  gripLabel,
}: {
  item: BranchListItem
  gripLabel: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "border-b border-line bg-surface transition-colors",
        isDragging && "opacity-60"
      )}
    >
      <td className="w-10 px-3 py-2.5 align-middle">
        <button
          type="button"
          className="flex size-6 cursor-grab items-center justify-center text-ink-muted hover:text-ink focus-visible:outline-none"
          aria-label={gripLabel}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className="size-4" />
        </button>
      </td>
      <td className="px-3 py-2.5 align-middle font-mono text-xs text-ink-muted">
        {item.slug}
      </td>
      <td className="px-3 py-2.5 align-middle text-sm text-ink">
        {item.displayName}
      </td>
      <td className="px-3 py-2.5 text-end align-middle">
        <BranchRowActions
          id={item.id}
          slug={item.slug}
          published={item.published}
        />
      </td>
    </tr>
  )
}

export function BranchList({ items }: { items: BranchListItem[] }) {
  const t = useTranslations("Admin.branches.list")
  const tt = useTranslations("Admin.toasts")
  const [prevItems, setPrevItems] = React.useState(items)
  const [rows, setRows] = React.useState(items)
  if (items !== prevItems) {
    setPrevItems(items)
    setRows(items)
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

    const payload = next.map((row, idx) => ({ id: row.id, sortOrder: idx }))
    const result = await reorderBranchesAction(payload)
    if (result.status === "success") {
      toast.success(tt("orderSaved"))
    } else {
      setRows(prev)
      toast.error(tt("genericError"))
    }
  }

  if (rows.length === 0) {
    return (
      <div className="border border-line bg-surface p-6 text-center text-sm text-ink-muted">
        {t("empty")}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={rows.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="relative w-full overflow-auto border border-line bg-surface">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/40 text-xs font-medium tracking-wide text-ink-muted uppercase">
              <tr className="border-b border-line">
                <th className="w-10 px-3 py-2 text-start" aria-hidden />
                <th className="px-3 py-2 text-start">{t("slug")}</th>
                <th className="px-3 py-2 text-start">{t("name")}</th>
                <th className="px-3 py-2 text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  gripLabel={t("dragToReorder")}
                />
              ))}
            </tbody>
          </table>
        </div>
      </SortableContext>
    </DndContext>
  )
}
