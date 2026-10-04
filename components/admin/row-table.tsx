"use client"

import { arrayMove } from "@dnd-kit/sortable"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { followMove, followRemove } from "@/lib/admin/reorder"
import { cn } from "@/lib/utils"

import { InlineConfirm } from "./inline-confirm"
import { InfoTooltip } from "./info-tooltip"
import { DragHandle, SortableArea, useSortableRow } from "./sortable"

interface RowColumn<T> {
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
  tooltip?: string
}

interface RowTableProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  createItem: () => NoInfer<T>
  addLabel: string
  emptyLabel?: string
  columns: RowColumn<T>[]
  canRemove?: (item: T) => boolean
  canEdit?: (item: T) => boolean
  renderRow: (item: T, update: (item: T) => void) => React.ReactNode
}

export function RowTable<T>({
  items,
  onChange,
  createItem,
  addLabel,
  emptyLabel,
  columns,
  canRemove,
  canEdit,
  renderRow,
}: RowTableProps<T>) {
  const t = useTranslations("admin.common")
  const [editing, setEditing] = useState<number | null>(null)
  const [confirming, setConfirming] = useState<number | null>(null)

  function addItem() {
    setConfirming(null)
    setEditing(items.length)
    onChange([...items, createItem()])
  }

  function removeItem(index: number) {
    setConfirming(null)
    setEditing((current) =>
      current === null || current === index
        ? null
        : followRemove(current, index)
    )
    onChange(items.filter((_, i) => i !== index))
  }

  function moveItem(from: number, to: number) {
    setEditing((current) =>
      current === null ? null : followMove(current, from, to)
    )
    setConfirming(null)
    onChange(arrayMove(items, from, to))
  }

  const columnCount = columns.length + 2

  return (
    <div className="space-y-2">
      <SortableArea count={items.length} onMove={moveItem}>
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
            {items.map((item, index) => {
              const editable = canEdit?.(item) ?? true
              return (
                <SortableRow
                  key={index}
                  id={index}
                  columnCount={columnCount}
                  editable={editable}
                  expanded={editable && editing === index}
                  onToggle={() => {
                    setConfirming(null)
                    setEditing(editing === index ? null : index)
                  }}
                  cells={columns.map((column) => (
                    <td
                      key={column.header}
                      className={cn(
                        "py-2 pe-2 align-middle",
                        editable && "cursor-pointer",
                        column.className
                      )}
                    >
                      {column.cell(item)}
                    </td>
                  ))}
                  removable={canRemove?.(item) ?? true}
                  onRemove={() => setConfirming(index)}
                  confirm={
                    confirming === index && (
                      <InlineConfirm
                        message={t("removeRowMessage")}
                        confirmLabel={t("remove")}
                        onConfirm={() => removeItem(index)}
                        onCancel={() => setConfirming(null)}
                      />
                    )
                  }
                >
                  {renderRow(item, (next) =>
                    onChange(items.map((row, i) => (i === index ? next : row)))
                  )}
                </SortableRow>
              )
            })}
          </tbody>
        </table>
      </SortableArea>

      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  )
}

function SortableRow({
  id,
  columnCount,
  editable,
  expanded,
  onToggle,
  cells,
  removable,
  onRemove,
  confirm,
  children,
}: {
  id: number
  columnCount: number
  editable: boolean
  expanded: boolean
  onToggle: () => void
  cells: React.ReactNode
  removable: boolean
  onRemove: () => void
  confirm: React.ReactNode
  children: React.ReactNode
}) {
  const t = useTranslations("admin.common")
  const { setNodeRef, isDragging, style, handleProps } = useSortableRow(id)

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        onClick={(event) => {
          if (!editable || (event.target as HTMLElement).closest("button"))
            return
          onToggle()
        }}
        className={cn(
          "border-b border-border/60 hover:bg-muted/30",
          expanded && "bg-muted/40",
          isDragging && "relative z-10 bg-muted"
        )}
      >
        <td className="w-8 py-2 align-middle">
          <DragHandle {...handleProps} />
        </td>
        {cells}
        <td className="w-20 py-2 align-middle">
          <div className="flex justify-end gap-1">
            {editable && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("edit")}
                aria-expanded={expanded}
                onClick={onToggle}
              >
                <Pencil />
              </Button>
            )}
            {removable && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("remove")}
                className="text-muted-foreground hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 />
              </Button>
            )}
          </div>
        </td>
      </tr>

      {confirm && (
        <tr className="border-b border-border/60 bg-muted/40">
          <td colSpan={columnCount} className="p-3">
            {confirm}
          </td>
        </tr>
      )}
      {expanded && (
        <tr className="border-b border-border/60 bg-muted/40">
          <td colSpan={columnCount} className="p-3">
            <div className="space-y-4">
              {children}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onToggle}
                >
                  {t("done")}
                </Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
