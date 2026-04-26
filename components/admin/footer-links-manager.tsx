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

import { routing, type Locale } from "@/i18n/routing"
import {
  deleteFooterLinkAction,
  reorderFooterLinksAction,
  saveFooterLinkAction,
} from "@/app/[locale]/admin/(protected)/_actions/footer"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { ConfirmDeleteDialog } from "./shared/confirm-delete-dialog"
import { FieldLabelWithTooltip } from "./shared/field-label-with-tooltip"

export type FooterLinkRow = {
  id: string
  locale: Locale
  groupKey: string
  label: string
  href: string
  sortOrder: number
}

export function FooterLinksManager({
  initial,
  suggestedGroupKeys,
  branchId,
}: {
  initial: FooterLinkRow[]
  suggestedGroupKeys: string[]
  branchId: string
}) {
  const t = useTranslations("Admin.footer")
  const tt = useTranslations("Admin.toasts")
  const [rows, setRows] = React.useState(initial)
  const [prev, setPrev] = React.useState(initial)
  if (initial !== prev) {
    setPrev(initial)
    setRows(initial)
  }

  const groups = React.useMemo(() => {
    const map = new Map<string, FooterLinkRow[]>()
    for (const row of rows) {
      const key = `${row.locale}::${row.groupKey}`
      const list = map.get(key) ?? []
      list.push(row)
      map.set(key, list)
    }
    return Array.from(map.entries())
      .map(([key, links]) => {
        const [locale, groupKey] = key.split("::") as [Locale, string]
        return {
          locale,
          groupKey,
          links: [...links].sort((a, b) => a.sortOrder - b.sortOrder),
        }
      })
      .sort((a, b) => {
        if (a.locale === b.locale) return a.groupKey.localeCompare(b.groupKey)
        return a.locale.localeCompare(b.locale)
      })
  }, [rows])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("linksTitle")}</CardTitle>
        <CardAction>
          <NewLinkButton
            suggestedGroupKeys={suggestedGroupKeys}
            branchId={branchId}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {groups.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">
            {t("linksEmpty")}
          </p>
        ) : (
          groups.map((group, idx) => (
            <React.Fragment key={`${group.locale}::${group.groupKey}`}>
              {idx > 0 ? <Separator /> : null}
              <FooterLinkGroup
                group={group}
                branchId={branchId}
                onReordered={(reordered) => {
                  const ids = new Set(reordered.map((r) => r.id))
                  setRows((current) => {
                    const rest = current.filter((r) => !ids.has(r.id))
                    return [...rest, ...reordered]
                  })
                }}
                onReorderFailed={() => {
                  toast.error(tt("genericError"))
                  setRows(prev)
                }}
                onOrderSaved={() => toast.success(tt("orderSaved"))}
              />
            </React.Fragment>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function FooterLinkGroup({
  group,
  branchId,
  onReordered,
  onReorderFailed,
  onOrderSaved,
}: {
  group: { locale: Locale; groupKey: string; links: FooterLinkRow[] }
  branchId: string
  onReordered: (rows: FooterLinkRow[]) => void
  onReorderFailed: () => void
  onOrderSaved: () => void
}) {
  const [localRows, setLocalRows] = React.useState(group.links)
  const [prev, setPrev] = React.useState(group.links)
  if (group.links !== prev) {
    setPrev(group.links)
    setLocalRows(group.links)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = localRows.findIndex((r) => r.id === active.id)
    const newIdx = localRows.findIndex((r) => r.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return

    const moved = arrayMove(localRows, oldIdx, newIdx).map((r, i) => ({
      ...r,
      sortOrder: i,
    }))
    setLocalRows(moved)
    onReordered(moved)

    const result = await reorderFooterLinksAction(
      branchId,
      group.locale,
      group.groupKey,
      moved.map((r) => ({ id: r.id, sortOrder: r.sortOrder }))
    )
    if (result.status === "success") onOrderSaved()
    else {
      setLocalRows(group.links)
      onReorderFailed()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2 text-xs text-ink-muted uppercase">
        <span className="font-medium tracking-[0.18em]">{group.groupKey}</span>
        <span className="font-mono normal-case">{group.locale}</span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localRows.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2">
            {localRows.map((row) => (
              <SortableLinkRow key={row.id} row={row} branchId={branchId} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableLinkRow({
  row,
  branchId,
}: {
  row: FooterLinkRow
  branchId: string
}) {
  const t = useTranslations("Admin.footer")
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
        <FooterLinkForm row={row} branchId={branchId} />
      </div>
    </li>
  )
}

function FooterLinkForm({
  row,
  branchId,
}: {
  row: FooterLinkRow
  branchId: string
}) {
  const t = useTranslations("Admin.footer")
  const tTip = useTranslations("Admin.footer.tooltips")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const initialState: FormState<{ id: string }> = { status: "idle" }
  const [state, formAction, pending] = useActionState(
    saveFooterLinkAction,
    initialState
  )
  const [deletePending, startDelete] = React.useTransition()

  useEffect(() => {
    if (state.status === "success") toast.success(tt("footerLinkSaved"))
    if (state.status === "error")
      toast.error(state.message ?? tt("genericError"))
  }, [state, tt])

  function handleDelete() {
    startDelete(async () => {
      const fd = new FormData()
      fd.set("id", row.id)
      fd.set("branchId", branchId)
      const result = await deleteFooterLinkAction(fd)
      if (result.status === "success") toast.success(tt("footerLinkDeleted"))
      else toast.error(tt("genericError"))
    })
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={row.id} />
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="locale" value={row.locale} />
      <input type="hidden" name="groupKey" value={row.groupKey} />
      <input type="hidden" name="sortOrder" value={row.sortOrder} />
      <div className="grid gap-3 md:grid-cols-[1fr_1.5fr]">
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("label")}>
            {t("label")}
          </FieldLabelWithTooltip>
          <Input name="label" defaultValue={row.label} required />
        </Field>
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("href")}>
            {t("href")}
          </FieldLabelWithTooltip>
          <Input name="href" defaultValue={row.href} required />
        </Field>
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
          description={t("confirmDeleteDescription", { label: row.label })}
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
  )
}

function NewLinkButton({
  suggestedGroupKeys,
  branchId,
}: {
  suggestedGroupKeys: string[]
  branchId: string
}) {
  const t = useTranslations("Admin.footer")
  const tTip = useTranslations("Admin.footer.tooltips")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const [open, setOpen] = React.useState(false)
  const [locale, setLocale] = React.useState<Locale>(routing.defaultLocale)
  const [groupKey, setGroupKey] = React.useState(suggestedGroupKeys[0] ?? "")
  const [label, setLabel] = React.useState("")
  const [href, setHref] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const fd = new FormData()
      fd.set("branchId", branchId)
      fd.set("locale", locale)
      fd.set("groupKey", groupKey)
      fd.set("label", label)
      fd.set("href", href)
      const result = await saveFooterLinkAction({ status: "idle" }, fd)
      if (result.status === "success") {
        toast.success(tt("footerLinkCreated"))
        setOpen(false)
        setLabel("")
        setHref("")
      } else {
        toast.error(tt("genericError"))
      }
    })
  }

  if (!open) {
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <IconPlus className="size-3.5" />
        {t("addLink")}
      </Button>
    )
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 bg-surface"
    >
      <Field className="w-24">
        <FieldLabelWithTooltip tooltip={tTip("locale")}>
          {t("locale")}
        </FieldLabelWithTooltip>
        <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {routing.locales.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field className="w-32">
        <FieldLabelWithTooltip tooltip={tTip("groupKey")}>
          {t("groupKey")}
        </FieldLabelWithTooltip>
        <Input
          value={groupKey}
          onChange={(e) => setGroupKey(e.target.value)}
          required
          list="footer-group-suggestions"
        />
        <datalist id="footer-group-suggestions">
          {suggestedGroupKeys.map((key) => (
            <option key={key} value={key} />
          ))}
        </datalist>
      </Field>
      <Field className="min-w-40 flex-1">
        <FieldLabelWithTooltip tooltip={tTip("label")}>
          {t("label")}
        </FieldLabelWithTooltip>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
      </Field>
      <Field className="min-w-40 flex-1">
        <FieldLabelWithTooltip tooltip={tTip("href")}>
          {t("href")}
        </FieldLabelWithTooltip>
        <Input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          required
          placeholder="/legal/terms"
        />
      </Field>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          {tc("cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {tc("save")}
        </Button>
      </div>
    </form>
  )
}
