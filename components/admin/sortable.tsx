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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId } from "react"

export function SortableArea({
  count,
  onMove,
  children,
}: {
  count: number
  onMove: (from: number, to: number) => void
  children: React.ReactNode
}) {
  const t = useTranslations("admin.common")
  const dndId = useId()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    onMove(Number(active.id), Number(over.id))
  }

  return (
    <DndContext
      id={dndId}
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
      <SortableContext
        items={Array.from({ length: count }, (_, index) => index)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  )
}

export function useSortableRow(id: number) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return {
    setNodeRef,
    isDragging,
    style: { transform: CSS.Transform.toString(transform), transition },
    handleProps: { ...attributes, ...listeners },
  }
}

export function DragHandle(props: React.ComponentProps<"button">) {
  const t = useTranslations("admin.common")
  return (
    <button
      type="button"
      className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      aria-label={t("reorder")}
      {...props}
    >
      <GripVertical className="size-4" />
    </button>
  )
}
