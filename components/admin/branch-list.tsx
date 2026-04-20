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
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
  publishedLabel,
  draftLabel,
}: {
  item: BranchListItem
  gripLabel: string
  publishedLabel: string
  draftLabel: string
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
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      data-dragging={isDragging ? "" : undefined}
      className={cn("data-[dragging]:bg-muted/40 data-[dragging]:opacity-60")}
    >
      <TableCell className="w-10 ps-4">
        <button
          type="button"
          className="flex size-6 cursor-grab items-center justify-center text-ink-muted hover:text-ink focus-visible:outline-none"
          aria-label={gripLabel}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="text-sm text-ink">{item.displayName}</TableCell>
      <TableCell className="font-mono text-xs text-ink-muted">
        {item.slug}
      </TableCell>
      <TableCell>
        {item.published ? (
          <Badge variant="default">{publishedLabel}</Badge>
        ) : (
          <Badge variant="secondary">{draftLabel}</Badge>
        )}
      </TableCell>
      <TableCell className="pe-4 text-end">
        <BranchRowActions
          id={item.id}
          slug={item.slug}
          published={item.published}
        />
      </TableCell>
    </TableRow>
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
      <Card className="p-10 text-center text-sm text-ink-muted">
        {t("empty")}
      </Card>
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
        <Card className="py-0">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 ps-4" aria-hidden />
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("slug")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="pe-4 text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  gripLabel={t("dragToReorder")}
                  publishedLabel={t("published")}
                  draftLabel={t("draft")}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      </SortableContext>
    </DndContext>
  )
}
