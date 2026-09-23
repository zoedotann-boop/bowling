"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { AdminModal, ConfirmModal, useInDialog } from "./admin-modal"
import { InfoTooltip } from "./info-tooltip"

interface RowColumn<T> {
  header: string
  cell: (item: T, index: number) => React.ReactNode
  className?: string
  tooltip?: string
}

interface RowTableProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  createItem: () => T
  addLabel: string
  emptyLabel?: string
  columns: RowColumn<T>[]
  editTitle: (item: T, index: number) => string
  renderRow: (
    item: T,
    index: number,
    update: (item: T) => void
  ) => React.ReactNode
}

// The workhorse for every list. Controlled (items/onChange are a slice of the
// draft), reorderable with dnd-kit, and dual-mode: a top-level table edits rows
// in a modal, a nested one (inside a dialog) expands rows inline — never a
// dialog inside a dialog.
export function RowTable<T>({
  items,
  onChange,
  createItem,
  addLabel,
  emptyLabel,
  columns,
  editTitle,
  renderRow,
}: RowTableProps<T>) {
  const t = useTranslations("admin.common")
  const inDialog = useInDialog()

  // Draft rows may have no id yet, so dnd-kit sorts by array index. Reordering
  // rewrites the array (via onChange), which keeps indices contiguous.
  const itemIds = items.map((_, index) => index)

  const [editing, setEditing] = useState<number | null>(null)
  const [confirming, setConfirming] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function updateItem(index: number, next: T) {
    onChange(items.map((item, i) => (i === index ? next : item)))
  }

  function addItem() {
    setEditing(items.length)
    onChange([...items, createItem()])
  }

  function removeItem(index: number) {
    setEditing(null)
    setConfirming(null)
    onChange(items.filter((_, i) => i !== index))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = Number(active.id)
    const to = Number(over.id)
    onChange(arrayMove(items, from, to))
  }

  const columnCount = columns.length + 2 // drag handle + actions

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) =>
              t("reorderStarted", { position: Number(active.id) + 1 }),
            onDragOver: ({ over }) =>
              over ? t("reorderMoved", { position: Number(over.id) + 1 }) : "",
            onDragEnd: ({ over }) =>
              over ? t("reorderEnded", { position: Number(over.id) + 1 }) : "",
            onDragCancel: () => t("reorderCancelled"),
          },
        }}
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-start text-xs text-muted-foreground">
              <th className="w-8" aria-hidden />
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={cn(
                    "py-1.5 pe-2 text-start font-medium",
                    column.className
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {column.header}
                    {column.tooltip && <InfoTooltip text={column.tooltip} />}
                  </span>
                </th>
              ))}
              <th className="w-20" aria-hidden />
            </tr>
          </thead>
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    {emptyLabel ?? t("empty")}
                  </td>
                </tr>
              )}
              {items.map((item, index) => (
                <SortableRow
                  key={index}
                  id={index}
                  item={item}
                  index={index}
                  columns={columns}
                  reorderLabel={t("reorder")}
                  editLabel={t("edit")}
                  removeLabel={t("remove")}
                  onEdit={() => setEditing(editing === index ? null : index)}
                  onRemove={() => setConfirming(index)}
                  expanded={inDialog && editing === index}
                  confirming={inDialog && confirming === index}
                  columnCount={columnCount}
                  removeMessage={t("removeRowMessage")}
                  cancelLabel={t("cancel")}
                  confirmLabel={t("remove")}
                  onConfirmRemove={() => removeItem(index)}
                  onCancelRemove={() => setConfirming(null)}
                  editContent={renderRow(item, index, (next) =>
                    updateItem(index, next)
                  )}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>

      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus />
        {addLabel}
      </Button>

      {/* Top-level: edit in a modal, confirm deletion in a modal. */}
      {!inDialog && editing !== null && items[editing] !== undefined && (
        <AdminModal
          open
          onClose={() => setEditing(null)}
          title={editTitle(items[editing], editing)}
          closeLabel={t("close")}
        >
          {renderRow(items[editing], editing, (next) =>
            updateItem(editing, next)
          )}
        </AdminModal>
      )}
      {!inDialog && confirming !== null && (
        <ConfirmModal
          open
          onClose={() => setConfirming(null)}
          onConfirm={() => removeItem(confirming)}
          title={t("remove")}
          message={t("removeRowMessage")}
          confirmLabel={t("remove")}
          cancelLabel={t("cancel")}
        />
      )}
    </div>
  )
}

function SortableRow<T>({
  id,
  item,
  index,
  columns,
  reorderLabel,
  editLabel,
  removeLabel,
  onEdit,
  onRemove,
  expanded,
  confirming,
  columnCount,
  removeMessage,
  cancelLabel,
  confirmLabel,
  onConfirmRemove,
  onCancelRemove,
  editContent,
}: {
  id: number
  item: T
  index: number
  columns: RowColumn<T>[]
  reorderLabel: string
  editLabel: string
  removeLabel: string
  onEdit: () => void
  onRemove: () => void
  expanded: boolean
  confirming: boolean
  columnCount: number
  removeMessage: string
  cancelLabel: string
  confirmLabel: string
  onConfirmRemove: () => void
  onCancelRemove: () => void
  editContent: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <>
      <tr
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={cn(
          "border-b border-border/60",
          isDragging && "relative z-10 bg-muted"
        )}
      >
        <td className="w-8 py-1.5 align-middle">
          <button
            type="button"
            className="flex size-6 items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label={reorderLabel}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        </td>
        {columns.map((column) => (
          <td key={column.header} className="py-1.5 pe-2 align-middle">
            {column.cell(item, index)}
          </td>
        ))}
        <td className="w-20 py-1.5 align-middle">
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={editLabel}
              aria-expanded={expanded}
              onClick={onEdit}
            >
              <Pencil />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={removeLabel}
              onClick={onRemove}
            >
              <Trash2 />
            </Button>
          </div>
        </td>
      </tr>

      {/* Nested (inside a dialog): the editor expands inline as an extra row. */}
      {expanded && (
        <tr className="border-b border-border/60 bg-muted/40">
          <td colSpan={columnCount} className="p-3">
            {editContent}
          </td>
        </tr>
      )}
      {confirming && (
        <tr className="border-b border-border/60 bg-muted/40">
          <td colSpan={columnCount} className="p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{removeMessage}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancelRemove}
                >
                  {cancelLabel}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onConfirmRemove}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
