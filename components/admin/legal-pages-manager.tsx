"use client"

import * as React from "react"
import { useActionState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { IconChevronDown, IconPlus, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { routing, type Locale } from "@/i18n/routing"
import {
  deleteLegalPageAction,
  saveLegalPageAction,
} from "@/app/[locale]/admin/(protected)/_actions/legal"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { FieldLabelWithTooltip } from "./shared/field-label-with-tooltip"

export type LegalPageRow = {
  slug: string
  titles: Record<Locale, string | null>
  bodies: Record<Locale, string | null>
  published: boolean
  sortOrder: number
}

type Mode = "edit" | "create"

export function LegalPagesManager({
  initial,
  branchId,
}: {
  initial: LegalPageRow[]
  branchId: string
}) {
  const t = useTranslations("Admin.legal")
  const [creating, setCreating] = React.useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardAction>
          <Button type="button" size="sm" onClick={() => setCreating(true)}>
            <IconPlus className="size-3.5" />
            {t("addPage")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {creating ? (
          <>
            <LegalPageFormCard
              mode="create"
              row={emptyRow()}
              branchId={branchId}
              onDone={() => setCreating(false)}
            />
            <Separator />
          </>
        ) : null}
        {initial.length === 0 && !creating ? (
          <p className="py-6 text-center text-sm text-ink-muted">
            {t("empty")}
          </p>
        ) : null}
        {initial.map((row, idx) => (
          <React.Fragment key={row.slug}>
            {idx > 0 ? <Separator /> : null}
            <LegalPageCollapsible row={row} branchId={branchId} />
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  )
}

function pickTitle(row: LegalPageRow): string | null {
  const def = row.titles[routing.defaultLocale]
  if (def) return def
  for (const loc of routing.locales) {
    const v = row.titles[loc]
    if (v) return v
  }
  return null
}

function LegalPageCollapsible({
  row,
  branchId,
}: {
  row: LegalPageRow
  branchId: string
}) {
  const t = useTranslations("Admin.legal")
  const summary = pickTitle(row)
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-start text-sm font-medium text-ink hover:text-ink/80 focus-visible:outline-none">
        <span className="flex min-w-0 flex-col">
          <span className="font-mono text-xs text-ink-muted">{row.slug}</span>
          <span className="truncate">
            {summary || (
              <span className="text-ink-muted italic">{t("untitled")}</span>
            )}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-ink-muted">
          {row.published ? null : (
            <span className="rounded-none bg-muted px-1 py-0.5 text-[10px] tracking-wide uppercase">
              {t("draftBadge")}
            </span>
          )}
          <IconChevronDown className="size-4 transition-transform group-data-[panel-open]:rotate-180" />
        </span>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className="pt-3">
          <LegalPageFormCard mode="edit" row={row} branchId={branchId} />
        </div>
      </CollapsiblePanel>
    </Collapsible>
  )
}

function emptyRow(): LegalPageRow {
  const titles = {} as Record<Locale, string | null>
  const bodies = {} as Record<Locale, string | null>
  for (const loc of routing.locales) {
    titles[loc] = null
    bodies[loc] = null
  }
  return { slug: "", titles, bodies, published: true, sortOrder: 0 }
}

function LegalPageFormCard({
  mode,
  row,
  branchId,
  onDone,
}: {
  mode: Mode
  row: LegalPageRow
  branchId: string
  onDone?: () => void
}) {
  const t = useTranslations("Admin.legal")
  const tTip = useTranslations("Admin.legal.tooltips")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const initialState: FormState<{ slug: string }> = { status: "idle" }
  const [state, formAction, pending] = useActionState(
    saveLegalPageAction,
    initialState
  )
  const [deletePending, startDelete] = React.useTransition()

  useEffect(() => {
    if (state.status === "success") {
      toast.success(
        mode === "create" ? tt("legalPageCreated") : tt("legalPageSaved")
      )
      if (mode === "create" && onDone) onDone()
    }
    if (state.status === "error")
      toast.error(state.message ?? tt("genericError"))
  }, [state, mode, onDone, tt])

  function handleDelete() {
    startDelete(async () => {
      const fd = new FormData()
      fd.set("slug", row.slug)
      fd.set("branchId", branchId)
      const result = await deleteLegalPageAction(fd)
      if (result.status === "success") toast.success(tt("legalPageDeleted"))
      else toast.error(tt("genericError"))
    })
  }

  const fe =
    state.status === "error"
      ? (state.fieldErrors ?? {})
      : ({} as Record<string, string[]>)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="branchId" value={branchId} />
      <div className="grid gap-3 md:grid-cols-[12rem_8rem_1fr]">
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("slug")} required>
            {t("slug")}
          </FieldLabelWithTooltip>
          <Input
            name="slug"
            defaultValue={row.slug}
            required
            placeholder="terms"
            readOnly={mode === "edit"}
            aria-invalid={fe.slug ? true : undefined}
          />
          {fe.slug ? (
            <p className="text-xs text-destructive">{fe.slug[0]}</p>
          ) : null}
        </Field>
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("sortOrder")}>
            {t("sortOrder")}
          </FieldLabelWithTooltip>
          <Input name="sortOrder" type="number" defaultValue={row.sortOrder} />
        </Field>
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("published")}>
            {t("published")}
          </FieldLabelWithTooltip>
          <div className="flex h-9 items-center">
            <Switch name="published" defaultChecked={row.published} />
          </div>
        </Field>
      </div>

      <Tabs defaultValue={routing.defaultLocale}>
        <TabsList className="flex-wrap">
          {routing.locales.map((loc) => (
            <TabsTab key={loc} value={loc}>
              {loc}
            </TabsTab>
          ))}
        </TabsList>
        {routing.locales.map((loc) => {
          const titleKey = `title${loc.charAt(0).toUpperCase()}${loc.slice(1)}`
          const bodyKey = `bodyMarkdown${loc.charAt(0).toUpperCase()}${loc.slice(1)}`
          return (
            <TabsPanel key={loc} value={loc}>
              <div className="flex flex-col gap-3">
                <Field>
                  <FieldLabelWithTooltip tooltip={tTip("pageTitle")}>
                    {t("pageTitle")}
                  </FieldLabelWithTooltip>
                  <Input
                    name={titleKey}
                    defaultValue={row.titles[loc] ?? ""}
                    placeholder={
                      loc === routing.defaultLocale ? t("pageTitleHint") : ""
                    }
                  />
                </Field>
                <Field>
                  <FieldLabelWithTooltip tooltip={tTip("body")}>
                    {t("body")}
                  </FieldLabelWithTooltip>
                  <Textarea
                    name={bodyKey}
                    defaultValue={row.bodies[loc] ?? ""}
                    rows={10}
                    placeholder={t("bodyHint")}
                  />
                </Field>
              </div>
            </TabsPanel>
          )
        })}
      </Tabs>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
        {mode === "create" && onDone ? (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            {tc("cancel")}
          </Button>
        ) : null}
        {mode === "edit" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deletePending}
          >
            <IconTrash className="size-3.5" />
            {tc("delete")}
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={pending}>
          {mode === "create" ? tc("create") : tc("save")}
        </Button>
      </div>
    </form>
  )
}
