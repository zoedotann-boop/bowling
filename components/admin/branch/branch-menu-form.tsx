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
  deleteMenuCategoryAction,
  deleteMenuItemAction,
  reorderMenuCategoriesAction,
  reorderMenuItemsAction,
  saveMenuCategoryAction,
  saveMenuItemAction,
} from "@/app/[locale]/admin/(protected)/_actions/menu"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { cn } from "@/lib/utils"

import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog"
import { FieldLabelWithTooltip } from "../shared/field-label-with-tooltip"
import { TranslatableField } from "../translation/translatable-field"
import { TranslationStateProvider } from "../translation/translation-state-context"

export type MenuItemFormRow = {
  id: string
  amountCents: number
  sortOrder: number
  translations: Record<Locale, { name: string | null; tag: string | null }>
  needsReview: string[]
  aiGeneratedLocales: Locale[]
}

export type MenuCategoryFormRow = {
  id: string
  sortOrder: number
  translations: Record<Locale, { title: string | null }>
  needsReview: string[]
  aiGeneratedLocales: Locale[]
  items: MenuItemFormRow[]
}

type Props = {
  branchId: string
  slug: string
  initialCategories: MenuCategoryFormRow[]
}

function titleValues(
  row: MenuCategoryFormRow
): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {}
  for (const [locale, tr] of Object.entries(row.translations) as [
    Locale,
    MenuCategoryFormRow["translations"][Locale],
  ][]) {
    if (typeof tr.title === "string") out[locale] = tr.title
  }
  return out
}

function itemValues<K extends "name" | "tag">(
  item: MenuItemFormRow,
  field: K
): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {}
  for (const [locale, tr] of Object.entries(item.translations) as [
    Locale,
    MenuItemFormRow["translations"][Locale],
  ][]) {
    const value = tr[field]
    if (typeof value === "string") out[locale] = value
  }
  return out
}

function needsReviewLocales(needsReview: string[], prefix: string): Locale[] {
  const locales: Locale[] = []
  for (const path of needsReview) {
    if (!path.startsWith(`${prefix}.`)) continue
    const suffix = path.slice(prefix.length + 1)
    if (suffix && !locales.includes(suffix as Locale)) {
      locales.push(suffix as Locale)
    }
  }
  return locales
}

export function BranchMenuForm({ branchId, slug, initialCategories }: Props) {
  const t = useTranslations("Admin.menu")
  const tt = useTranslations("Admin.toasts")
  const [categories, setCategories] = React.useState(initialCategories)
  const [prevInitial, setPrevInitial] = React.useState(initialCategories)
  if (initialCategories !== prevInitial) {
    setPrevInitial(initialCategories)
    setCategories(initialCategories)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const prev = categories
    const next = arrayMove(categories, oldIndex, newIndex)
    setCategories(next)

    const payload = next.map((c, idx) => ({ id: c.id, sortOrder: idx }))
    const result = await reorderMenuCategoriesAction(branchId, slug, payload)
    if (result.status === "success") {
      toast.success(tt("orderSaved"))
    } else {
      setCategories(prev)
      toast.error(tt("genericError"))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-sm tracking-wide text-ink-muted uppercase">
          {t("title")}
        </h2>
        <NewCategoryButton branchId={branchId} slug={slug} />
      </div>
      {categories.length === 0 ? (
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
            items={categories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-4">
              {categories.map((cat) => (
                <SortableCategory
                  key={cat.id}
                  category={cat}
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

function SortableCategory({
  category,
  branchId,
  slug,
}: {
  category: MenuCategoryFormRow
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.menu")
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

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
        aria-label={t("reorderCategory")}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-4" />
      </button>
      <div className="flex flex-1 flex-col gap-4">
        <CategoryForm category={category} branchId={branchId} slug={slug} />
        <ItemsList category={category} slug={slug} />
      </div>
    </li>
  )
}

function CategoryForm({
  category,
  branchId,
  slug,
}: {
  category: MenuCategoryFormRow
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.menu")
  const tTip = useTranslations("Admin.menu.tooltips")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const tTranslate = useTranslations("Admin.translate")
  const initialState: FormState<{ id: string }> = { status: "idle" }
  const [state, formAction, pending] = useActionState(
    saveMenuCategoryAction,
    initialState
  )
  const [deletePending, startDelete] = React.useTransition()

  useEffect(() => {
    if (state.status === "success") toast.success(tt("categorySaved"))
    if (state.status === "error")
      toast.error(state.message ?? tt("genericError"))
  }, [state, tt])

  function handleDelete() {
    startDelete(async () => {
      const fd = new FormData()
      fd.set("id", category.id)
      fd.set("slug", slug)
      const result = await deleteMenuCategoryAction(fd)
      if (result.status === "success") toast.success(tt("categoryDeleted"))
      else toast.error(tt("genericError"))
    })
  }

  return (
    <TranslationStateProvider initialAiLocales={category.aiGeneratedLocales}>
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={category.id} />
        <input type="hidden" name="branchId" value={branchId} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="sortOrder" value={category.sortOrder} />
        <TranslatableField
          name="title"
          label={t("categoryTitle")}
          tooltip={tTip("categoryTitle")}
          defaultValues={titleValues(category)}
          needsReviewLocales={needsReviewLocales(category.needsReview, "title")}
          aiLabel={tTranslate("fillField")}
          reviewLabel={tTranslate("fillField")}
        />
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
            title={t("confirmDeleteCategoryTitle")}
            description={t("confirmDeleteCategoryDescription")}
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

function ItemsList({
  category,
  slug,
}: {
  category: MenuCategoryFormRow
  slug: string
}) {
  const t = useTranslations("Admin.menu")
  const tt = useTranslations("Admin.toasts")
  const [items, setItems] = React.useState(category.items)
  const [prevInitial, setPrevInitial] = React.useState(category.items)
  if (category.items !== prevInitial) {
    setPrevInitial(category.items)
    setItems(category.items)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const prev = items
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)

    const payload = next.map((i, idx) => ({ id: i.id, sortOrder: idx }))
    const result = await reorderMenuItemsAction(category.id, slug, payload)
    if (result.status === "success") {
      toast.success(tt("orderSaved"))
    } else {
      setItems(prev)
      toast.error(tt("genericError"))
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-medium tracking-wide text-ink-muted uppercase">
          {t("itemsTitle")}
        </h3>
        <NewItemButton categoryId={category.id} slug={slug} />
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("itemsEmpty")}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  categoryId={category.id}
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

function SortableItem({
  item,
  categoryId,
  slug,
}: {
  item: MenuItemFormRow
  categoryId: string
  slug: string
}) {
  const t = useTranslations("Admin.menu")
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-start gap-2 border border-line bg-background p-3",
        isDragging && "opacity-60"
      )}
    >
      <button
        type="button"
        className="mt-1 flex size-6 shrink-0 cursor-grab items-center justify-center text-ink-muted hover:text-ink focus-visible:outline-none"
        aria-label={t("reorderItem")}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-4" />
      </button>
      <div className="flex-1">
        <ItemForm item={item} categoryId={categoryId} slug={slug} />
      </div>
    </li>
  )
}

function ItemForm({
  item,
  categoryId,
  slug,
}: {
  item: MenuItemFormRow
  categoryId: string
  slug: string
}) {
  const t = useTranslations("Admin.menu")
  const tTip = useTranslations("Admin.menu.tooltips")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const tTranslate = useTranslations("Admin.translate")
  const initialState: FormState<{ id: string }> = { status: "idle" }
  const [state, formAction, pending] = useActionState(
    saveMenuItemAction,
    initialState
  )
  const [deletePending, startDelete] = React.useTransition()

  useEffect(() => {
    if (state.status === "success") toast.success(tt("itemSaved"))
    if (state.status === "error")
      toast.error(state.message ?? tt("genericError"))
  }, [state, tt])

  function handleDelete() {
    startDelete(async () => {
      const fd = new FormData()
      fd.set("id", item.id)
      fd.set("slug", slug)
      const result = await deleteMenuItemAction(fd)
      if (result.status === "success") toast.success(tt("itemDeleted"))
      else toast.error(tt("genericError"))
    })
  }

  return (
    <TranslationStateProvider initialAiLocales={item.aiGeneratedLocales}>
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="categoryId" value={categoryId} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="sortOrder" value={item.sortOrder} />
        <div className="grid gap-3 md:grid-cols-[8rem_1fr_1fr]">
          <Field>
            <FieldLabelWithTooltip tooltip={tTip("amount")}>
              {t("amount")}
            </FieldLabelWithTooltip>
            <Input
              name="amountCents"
              type="number"
              min={0}
              step={1}
              defaultValue={item.amountCents}
              required
            />
          </Field>
          <TranslatableField
            name="name"
            label={t("itemName")}
            tooltip={tTip("itemName")}
            defaultValues={itemValues(item, "name")}
            needsReviewLocales={needsReviewLocales(item.needsReview, "name")}
            aiLabel={tTranslate("fillField")}
            reviewLabel={tTranslate("fillField")}
          />
          <TranslatableField
            name="tag"
            label={t("itemTag")}
            tooltip={tTip("itemTag")}
            defaultValues={itemValues(item, "tag")}
            needsReviewLocales={needsReviewLocales(item.needsReview, "tag")}
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
            title={t("confirmDeleteItemTitle")}
            description={t("confirmDeleteItemDescription")}
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

function NewCategoryButton({
  branchId,
  slug,
}: {
  branchId: string
  slug: string
}) {
  const t = useTranslations("Admin.menu")
  const tt = useTranslations("Admin.toasts")
  const [pending, startTransition] = React.useTransition()

  function handleAdd() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set("branchId", branchId)
      fd.set("slug", slug)
      const result = await saveMenuCategoryAction({ status: "idle" }, fd)
      if (result.status === "success") toast.success(tt("categoryCreated"))
      else toast.error(tt("genericError"))
    })
  }

  return (
    <Button type="button" size="sm" onClick={handleAdd} disabled={pending}>
      <IconPlus className="size-3.5" />
      {t("addCategory")}
    </Button>
  )
}

function NewItemButton({
  categoryId,
  slug,
}: {
  categoryId: string
  slug: string
}) {
  const t = useTranslations("Admin.menu")
  const tt = useTranslations("Admin.toasts")
  const [pending, startTransition] = React.useTransition()

  function handleAdd() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set("categoryId", categoryId)
      fd.set("slug", slug)
      fd.set("amountCents", "0")
      const result = await saveMenuItemAction({ status: "idle" }, fd)
      if (result.status === "success") toast.success(tt("itemCreated"))
      else toast.error(tt("genericError"))
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleAdd}
      disabled={pending}
    >
      <IconPlus className="size-3.5" />
      {t("addItem")}
    </Button>
  )
}
