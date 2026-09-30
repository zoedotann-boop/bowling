"use client"

import { arrayMove } from "@dnd-kit/sortable"
import { Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { followMove, followRemove } from "@/lib/admin/reorder"
import { cn } from "@/lib/utils"

import { AdminBadge, AdminCard } from "./admin-ui"
import { InlineConfirm } from "./inline-confirm"
import { DragHandle, SortableArea, useSortableRow } from "./sortable"

interface CollectionEditorProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  createItem: () => NoInfer<T>
  canAdd?: boolean
  addLabel: string
  emptyLabel: string
  removeLabel: string
  removeMessage: string
  itemLabel: (item: T) => string
  itemMeta?: (item: T) => React.ReactNode
  isHidden?: (item: T) => boolean
  detailActions?: (item: T) => React.ReactNode
  renderDetail: (item: T, update: (item: T) => void) => React.ReactNode
}

export function CollectionEditor<T>({
  items,
  onChange,
  createItem,
  canAdd = true,
  addLabel,
  emptyLabel,
  removeLabel,
  removeMessage,
  itemLabel,
  itemMeta,
  isHidden,
  detailActions,
  renderDetail,
}: CollectionEditorProps<T>) {
  const t = useTranslations("admin.common")
  const [selected, setSelected] = useState(0)
  const [confirming, setConfirming] = useState(false)

  const index = Math.min(selected, items.length - 1)
  const current = items[index]

  function select(next: number) {
    setConfirming(false)
    setSelected(next)
  }

  function addItem() {
    onChange([...items, createItem()])
    select(items.length)
  }

  function removeCurrent() {
    onChange(items.filter((_, i) => i !== index))
    select(followRemove(index, index))
  }

  function moveItem(from: number, to: number) {
    onChange(arrayMove(items, from, to))
    setSelected(followMove(index, from, to))
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <AdminCard className="p-2 lg:sticky lg:top-20">
        {items.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          <SortableArea count={items.length} onMove={moveItem}>
            <ul className="space-y-0.5">
              {items.map((item, i) => (
                <CollectionItem
                  key={i}
                  id={i}
                  label={itemLabel(item) || t("untitled")}
                  meta={itemMeta?.(item)}
                  hidden={isHidden?.(item) ?? false}
                  active={i === index}
                  onSelect={() => select(i)}
                />
              ))}
            </ul>
          </SortableArea>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          disabled={!canAdd}
          onClick={addItem}
        >
          <Plus />
          {addLabel}
        </Button>
      </AdminCard>

      {current !== undefined && (
        <AdminCard
          key={index}
          title={itemLabel(current) || t("untitled")}
          actions={
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              {detailActions?.(current)}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setConfirming(true)}
              >
                <Trash2 />
                {removeLabel}
              </Button>
            </div>
          }
        >
          {confirming && (
            <InlineConfirm
              message={removeMessage}
              confirmLabel={removeLabel}
              onConfirm={removeCurrent}
              onCancel={() => setConfirming(false)}
            />
          )}
          {renderDetail(current, (next) =>
            onChange(items.map((item, i) => (i === index ? next : item)))
          )}
        </AdminCard>
      )}
    </div>
  )
}

function CollectionItem({
  id,
  label,
  meta,
  hidden,
  active,
  onSelect,
}: {
  id: number
  label: string
  meta?: React.ReactNode
  hidden: boolean
  active: boolean
  onSelect: () => void
}) {
  const t = useTranslations("admin.common")
  const { setNodeRef, isDragging, style, handleProps } = useSortableRow(id)

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1 rounded-md ps-1",
        active ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted",
        isDragging && "relative z-10 bg-muted shadow-sm"
      )}
    >
      <DragHandle {...handleProps} />
      <button
        type="button"
        aria-current={active ? "true" : undefined}
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-2 pe-2 text-start text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate",
              active && "font-semibold",
              hidden && "text-muted-foreground"
            )}
          >
            {label}
          </span>
          {meta && (
            <span className="block truncate text-xs text-muted-foreground">
              {meta}
            </span>
          )}
        </span>
        {hidden && <AdminBadge>{t("hidden")}</AdminBadge>}
      </button>
    </li>
  )
}
