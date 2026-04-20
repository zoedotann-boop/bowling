"use client"

import * as React from "react"
import { useActionState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useRouter } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import {
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
} from "@/app/[locale]/admin/(protected)/_actions/branches"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"

import { ConfirmDeleteDialog } from "./confirm-delete-dialog"
import { TranslatableInput } from "./translatable-input"
import { TranslatableTextarea } from "./translatable-textarea"

export type BranchFormInitial = {
  id: string
  slug: string
  phone: string
  whatsapp: string
  email: string
  mapUrl: string
  latitude: number
  longitude: number
  brandAccent: "cherry" | "teal"
  heroImageId: string | null
  googlePlaceId: string | null
  published: boolean
  sortOrder: number
  translations: Record<
    Locale,
    {
      displayName: string | null
      shortName: string | null
      address: string | null
      city: string | null
      heroHeadline: string | null
      heroTagline: string | null
      seoTitle: string | null
      seoDescription: string | null
    }
  >
  needsReview: string[]
}

type Props = {
  mode: "create" | "edit"
  initial?: BranchFormInitial
}

const LIVE_TABS = ["info", "hero", "seo"] as const
const DISABLED_TABS = [
  "prices",
  "packages",
  "menu",
  "events",
  "reviews",
] as const

function localesValues<
  K extends keyof BranchFormInitial["translations"][Locale],
>(
  initial: BranchFormInitial | undefined,
  field: K
): Partial<Record<Locale, string>> {
  if (!initial) return {}
  const out: Partial<Record<Locale, string>> = {}
  for (const [locale, tr] of Object.entries(initial.translations) as [
    Locale,
    BranchFormInitial["translations"][Locale],
  ][]) {
    const value = tr[field]
    if (typeof value === "string") out[locale] = value
  }
  return out
}

function needsReviewLocalesFor(
  initial: BranchFormInitial | undefined,
  prefix: string
): Locale[] {
  if (!initial) return []
  const locales: Locale[] = []
  for (const path of initial.needsReview) {
    if (!path.startsWith(prefix)) continue
    const suffix = path.slice(prefix.length + 1)
    if (suffix && !locales.includes(suffix as Locale)) {
      locales.push(suffix as Locale)
    }
  }
  return locales
}

export function BranchForm(props: Props) {
  const t = useTranslations("Admin.branches.form")
  const tt = useTranslations("Admin.toasts")
  const tc = useTranslations("Admin.common")
  const tTabs = useTranslations("Admin.branches.tabs")
  const router = useRouter()
  const { mode, initial } = props

  const action = mode === "create" ? createBranchAction : updateBranchAction
  const initialState: FormState<{ id: string; slug: string }> = {
    status: "idle",
  }
  const [state, formAction, pending] = useActionState<
    FormState<{ id: string; slug: string }>,
    FormData
  >(action, initialState)

  const [deletePending, startDelete] = React.useTransition()

  useEffect(() => {
    if (state.status === "success") {
      toast.success(mode === "create" ? tt("branchCreated") : tt("branchSaved"))
      if (mode === "create" && state.data?.slug) {
        router.push(`/admin/branches/${state.data.slug}`)
        router.refresh()
      }
    }
    if (state.status === "error") {
      toast.error(state.message ?? tt("genericError"))
    }
  }, [state, mode, router, tt])

  function handleDelete() {
    if (mode !== "edit" || !initial) return
    startDelete(async () => {
      const fd = new FormData()
      fd.set("id", initial.id)
      const result = await deleteBranchAction(fd)
      if (result.status === "success") {
        toast.success(tt("branchDeleted"))
        router.push("/admin/branches")
        router.refresh()
      } else {
        toast.error(tt("genericError"))
      }
    })
  }

  const aiLabel = t("aiComingSoon")
  const reviewLabel = t("needsReview")
  const topError = state.status === "error" ? state.fieldErrors?._?.[0] : null

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {mode === "edit" && initial ? (
        <input type="hidden" name="id" value={initial.id} />
      ) : null}

      {topError ? (
        <div className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {topError}
        </div>
      ) : null}

      <Tabs defaultValue="info">
        <TabsList className="flex-wrap">
          {LIVE_TABS.map((tab) => (
            <TabsTab key={tab} value={tab}>
              {tTabs(tab)}
            </TabsTab>
          ))}
          {mode === "edit" ? (
            <TabsTab value="hours">{tTabs("hours")}</TabsTab>
          ) : null}
          {DISABLED_TABS.map((tab) => (
            <TabsTab
              key={tab}
              value={tab}
              disabled
              className="gap-1.5"
              title={tTabs("comingSoon")}
            >
              {tTabs(tab)}
              <span className="rounded-none bg-muted px-1 py-0.5 text-[10px] tracking-wide text-ink-muted uppercase">
                {tTabs("soon")}
              </span>
            </TabsTab>
          ))}
        </TabsList>

        <TabsPanel value="info">
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>{t("slug")}</FieldLabel>
              <Input
                name="slug"
                defaultValue={initial?.slug ?? ""}
                required
                placeholder="ramat-gan"
              />
            </Field>
            <Field>
              <FieldLabel>{t("sortOrder")}</FieldLabel>
              <Input
                name="sortOrder"
                type="number"
                defaultValue={initial?.sortOrder ?? 0}
              />
            </Field>
            <Field>
              <FieldLabel>{t("phone")}</FieldLabel>
              <Input
                name="phone"
                defaultValue={initial?.phone ?? ""}
                required
              />
            </Field>
            <Field>
              <FieldLabel>{t("whatsapp")}</FieldLabel>
              <Input
                name="whatsapp"
                defaultValue={initial?.whatsapp ?? ""}
                required
              />
            </Field>
            <Field>
              <FieldLabel>{t("email")}</FieldLabel>
              <Input
                name="email"
                type="email"
                defaultValue={initial?.email ?? ""}
                required
              />
            </Field>
            <Field>
              <FieldLabel>{t("mapUrl")}</FieldLabel>
              <Input
                name="mapUrl"
                type="url"
                defaultValue={initial?.mapUrl ?? ""}
                required
              />
            </Field>
            <Field>
              <FieldLabel>{t("latitude")}</FieldLabel>
              <Input
                name="latitude"
                type="number"
                step="any"
                defaultValue={initial?.latitude ?? ""}
                required
              />
            </Field>
            <Field>
              <FieldLabel>{t("longitude")}</FieldLabel>
              <Input
                name="longitude"
                type="number"
                step="any"
                defaultValue={initial?.longitude ?? ""}
                required
              />
            </Field>
            <Field>
              <FieldLabel>{t("brandAccent")}</FieldLabel>
              <select
                name="brandAccent"
                defaultValue={initial?.brandAccent ?? "cherry"}
                className="flex h-8 w-full rounded-none border border-border bg-background px-2.5 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
              >
                <option value="cherry">{t("brandAccentCherry")}</option>
                <option value="teal">{t("brandAccentTeal")}</option>
              </select>
            </Field>
            <Field className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-medium text-ink">
                <Switch
                  name="published"
                  defaultChecked={initial?.published ?? true}
                />
                {t("published")}
              </label>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TranslatableInput
              name="displayName"
              label={t("displayName")}
              defaultValues={localesValues(initial, "displayName")}
              needsReviewLocales={needsReviewLocalesFor(initial, "displayName")}
              required
              aiLabel={aiLabel}
              reviewLabel={reviewLabel}
            />
            <TranslatableInput
              name="shortName"
              label={t("shortName")}
              defaultValues={localesValues(initial, "shortName")}
              needsReviewLocales={needsReviewLocalesFor(initial, "shortName")}
              aiLabel={aiLabel}
              reviewLabel={reviewLabel}
            />
            <TranslatableInput
              name="address"
              label={t("address")}
              defaultValues={localesValues(initial, "address")}
              needsReviewLocales={needsReviewLocalesFor(initial, "address")}
              aiLabel={aiLabel}
              reviewLabel={reviewLabel}
            />
            <TranslatableInput
              name="city"
              label={t("city")}
              defaultValues={localesValues(initial, "city")}
              needsReviewLocales={needsReviewLocalesFor(initial, "city")}
              aiLabel={aiLabel}
              reviewLabel={reviewLabel}
            />
          </div>
        </TabsPanel>

        <TabsPanel value="hero">
          <Field>
            <FieldLabel>{t("heroImageId")}</FieldLabel>
            <Input
              name="heroImageId"
              defaultValue={initial?.heroImageId ?? ""}
              placeholder={t("heroImageIdHint")}
            />
          </Field>
          <TranslatableInput
            name="heroHeadline"
            label={t("heroHeadline")}
            defaultValues={localesValues(initial, "heroHeadline")}
            needsReviewLocales={needsReviewLocalesFor(initial, "heroHeadline")}
            aiLabel={aiLabel}
            reviewLabel={reviewLabel}
          />
          <TranslatableTextarea
            name="heroTagline"
            label={t("heroTagline")}
            defaultValues={localesValues(initial, "heroTagline")}
            needsReviewLocales={needsReviewLocalesFor(initial, "heroTagline")}
            aiLabel={aiLabel}
            reviewLabel={reviewLabel}
            rows={2}
          />
        </TabsPanel>

        <TabsPanel value="seo">
          <TranslatableInput
            name="seoTitle"
            label={t("seoTitle")}
            defaultValues={localesValues(initial, "seoTitle")}
            needsReviewLocales={needsReviewLocalesFor(initial, "seoTitle")}
            aiLabel={aiLabel}
            reviewLabel={reviewLabel}
          />
          <TranslatableTextarea
            name="seoDescription"
            label={t("seoDescription")}
            defaultValues={localesValues(initial, "seoDescription")}
            needsReviewLocales={needsReviewLocalesFor(
              initial,
              "seoDescription"
            )}
            aiLabel={aiLabel}
            reviewLabel={reviewLabel}
            rows={3}
          />
          <Field>
            <FieldLabel>{t("googlePlaceId")}</FieldLabel>
            <Input
              name="googlePlaceId"
              defaultValue={initial?.googlePlaceId ?? ""}
              placeholder={t("googlePlaceIdHint")}
            />
          </Field>
        </TabsPanel>
      </Tabs>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <Button type="submit" size="sm" disabled={pending}>
          {mode === "create" ? t("create") : t("save")}
        </Button>
      </div>

      {mode === "edit" && initial ? (
        <section className="mt-4 border border-destructive/40 bg-destructive/5 p-4">
          <h3 className="text-sm font-medium text-destructive">
            {t("dangerZone")}
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            {t("dangerZoneDescription")}
          </p>
          <div className="mt-3">
            <ConfirmDeleteDialog
              trigger={
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deletePending}
                >
                  {tc("delete")}
                </Button>
              }
              title={t("confirmDeleteTitle")}
              description={t("confirmDeleteDescription")}
              cancelLabel={tc("cancel")}
              confirmLabel={tc("delete")}
              pending={deletePending}
              onConfirm={handleDelete}
            />
          </div>
        </section>
      ) : null}
    </form>
  )
}
