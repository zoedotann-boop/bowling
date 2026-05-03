"use client"

import * as React from "react"
import { useActionState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { IconChevronDown } from "@tabler/icons-react"
import { toast } from "sonner"

import { useRouter } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import {
  createBranchAction,
  updateBranchAction,
} from "@/app/[locale]/admin/(protected)/_actions/branches"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

import { FieldLabelWithTooltip } from "../shared/field-label-with-tooltip"
import { FillTranslationsButton } from "../translation/fill-translations-button"
import { MediaPicker } from "../media/media-picker"
import { TranslatableField } from "../translation/translatable-field"
import { TranslationStateProvider } from "../translation/translation-state-context"

export type BranchFormInitial = {
  id: string
  slug: string
  phone: string
  whatsapp: string
  email: string
  mapUrl: string
  latitude: number
  longitude: number
  heroImageId: string | null
  heroImage: {
    id: string
    blobUrl: string
    filename: string | null
  } | null
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
  aiGeneratedLocales: Locale[]
}

type Props = {
  mode: "create" | "edit"
  initial?: BranchFormInitial
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <Collapsible defaultOpen>
        <CardHeader>
          <CardTitle>
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-start hover:text-ink/80 focus-visible:outline-none">
              <span>{title}</span>
              <IconChevronDown className="size-5 shrink-0 transition-transform group-data-[panel-open]:rotate-180" />
            </CollapsibleTrigger>
          </CardTitle>
        </CardHeader>
        <CollapsiblePanel>
          <CardContent className="flex flex-col gap-6">{children}</CardContent>
        </CollapsiblePanel>
      </Collapsible>
    </Card>
  )
}

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
  const tTip = useTranslations("Admin.branches.form.tooltips")
  const tt = useTranslations("Admin.toasts")
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

  useEffect(() => {
    if (state.status === "success") {
      toast.success(mode === "create" ? tt("branchCreated") : tt("branchSaved"))
      if (mode === "create" && state.data?.slug) {
        router.push(`/admin/branches/${state.data.slug}/info`)
        router.refresh()
      }
    }
    if (state.status === "error") {
      toast.error(state.message ?? tt("genericError"))
    }
  }, [state, mode, router, tt])

  const tTranslate = useTranslations("Admin.translate")
  const aiLabel = tTranslate("fillField")
  const reviewLabel = t("needsReview")
  const topError = state.status === "error" ? state.fieldErrors?._?.[0] : null
  const domainHint =
    initial?.translations?.he?.displayName ?? initial?.slug ?? undefined

  const submitRow = (
    <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
      <FillTranslationsButton domainHint={domainHint ?? undefined} />
      <Button type="submit" size="sm" disabled={pending}>
        {mode === "create" ? t("create") : t("save")}
      </Button>
    </div>
  )

  const infoCard = (
    <SectionCard title={tTabs("info")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("slug")} required>
            {t("slug")}
          </FieldLabelWithTooltip>
          <Input
            name="slug"
            defaultValue={initial?.slug ?? ""}
            required
            placeholder="ramat-gan"
          />
        </Field>
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("sortOrder")}>
            {t("sortOrder")}
          </FieldLabelWithTooltip>
          <Input
            name="sortOrder"
            type="number"
            defaultValue={initial?.sortOrder ?? 0}
          />
        </Field>
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("phone")} required>
            {t("phone")}
          </FieldLabelWithTooltip>
          <Input name="phone" defaultValue={initial?.phone ?? ""} required />
        </Field>
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("whatsapp")} required>
            {t("whatsapp")}
          </FieldLabelWithTooltip>
          <Input
            name="whatsapp"
            defaultValue={initial?.whatsapp ?? ""}
            required
          />
        </Field>
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("email")} required>
            {t("email")}
          </FieldLabelWithTooltip>
          <Input
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
            required
          />
        </Field>
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("mapUrl")} required>
            {t("mapUrl")}
          </FieldLabelWithTooltip>
          <Input
            name="mapUrl"
            type="url"
            defaultValue={initial?.mapUrl ?? ""}
            required
          />
        </Field>
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("latitude")} required>
            {t("latitude")}
          </FieldLabelWithTooltip>
          <Input
            name="latitude"
            type="number"
            step="any"
            defaultValue={initial?.latitude ?? ""}
            required
          />
        </Field>
        <Field>
          <FieldLabelWithTooltip tooltip={tTip("longitude")} required>
            {t("longitude")}
          </FieldLabelWithTooltip>
          <Input
            name="longitude"
            type="number"
            step="any"
            defaultValue={initial?.longitude ?? ""}
            required
          />
        </Field>
        <Field className="md:col-span-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-ink">
              <Switch
                name="published"
                defaultChecked={initial?.published ?? true}
              />
              {t("published")}
            </label>
            <FieldLabelWithTooltip tooltip={tTip("published")}>
              <span className="sr-only">{t("published")}</span>
            </FieldLabelWithTooltip>
          </div>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TranslatableField
          name="displayName"
          label={t("displayName")}
          tooltip={tTip("displayName")}
          defaultValues={localesValues(initial, "displayName")}
          needsReviewLocales={needsReviewLocalesFor(initial, "displayName")}
          required
          aiLabel={aiLabel}
          reviewLabel={reviewLabel}
        />
        <TranslatableField
          name="shortName"
          label={t("shortName")}
          tooltip={tTip("shortName")}
          defaultValues={localesValues(initial, "shortName")}
          needsReviewLocales={needsReviewLocalesFor(initial, "shortName")}
          aiLabel={aiLabel}
          reviewLabel={reviewLabel}
        />
        <TranslatableField
          name="address"
          label={t("address")}
          tooltip={tTip("address")}
          defaultValues={localesValues(initial, "address")}
          needsReviewLocales={needsReviewLocalesFor(initial, "address")}
          aiLabel={aiLabel}
          reviewLabel={reviewLabel}
        />
        <TranslatableField
          name="city"
          label={t("city")}
          tooltip={tTip("city")}
          defaultValues={localesValues(initial, "city")}
          needsReviewLocales={needsReviewLocalesFor(initial, "city")}
          aiLabel={aiLabel}
          reviewLabel={reviewLabel}
        />
      </div>
      {submitRow}
    </SectionCard>
  )

  const heroCard = (
    <SectionCard title={tTabs("hero")}>
      <MediaPicker
        name="heroImageId"
        label={t("heroImageId")}
        tooltip={tTip("heroImageId")}
        initial={initial?.heroImage ?? null}
        branchId={initial?.id ?? ""}
      />
      <TranslatableField
        name="heroHeadline"
        label={t("heroHeadline")}
        tooltip={tTip("heroHeadline")}
        defaultValues={localesValues(initial, "heroHeadline")}
        needsReviewLocales={needsReviewLocalesFor(initial, "heroHeadline")}
        aiLabel={aiLabel}
        reviewLabel={reviewLabel}
      />
      <TranslatableField
        as="textarea"
        name="heroTagline"
        label={t("heroTagline")}
        tooltip={tTip("heroTagline")}
        defaultValues={localesValues(initial, "heroTagline")}
        needsReviewLocales={needsReviewLocalesFor(initial, "heroTagline")}
        aiLabel={aiLabel}
        reviewLabel={reviewLabel}
        rows={2}
      />
      {submitRow}
    </SectionCard>
  )

  const seoCard = (
    <SectionCard title={tTabs("seo")}>
      <TranslatableField
        name="seoTitle"
        label={t("seoTitle")}
        tooltip={tTip("seoTitle")}
        defaultValues={localesValues(initial, "seoTitle")}
        needsReviewLocales={needsReviewLocalesFor(initial, "seoTitle")}
        aiLabel={aiLabel}
        reviewLabel={reviewLabel}
      />
      <TranslatableField
        as="textarea"
        name="seoDescription"
        label={t("seoDescription")}
        tooltip={tTip("seoDescription")}
        defaultValues={localesValues(initial, "seoDescription")}
        needsReviewLocales={needsReviewLocalesFor(initial, "seoDescription")}
        aiLabel={aiLabel}
        reviewLabel={reviewLabel}
        rows={3}
      />
      <Field>
        <FieldLabelWithTooltip tooltip={tTip("googlePlaceId")}>
          {t("googlePlaceId")}
        </FieldLabelWithTooltip>
        <Input
          name="googlePlaceId"
          defaultValue={initial?.googlePlaceId ?? ""}
          placeholder={t("googlePlaceIdHint")}
        />
      </Field>
      {submitRow}
    </SectionCard>
  )

  return (
    <TranslationStateProvider
      initialAiLocales={initial?.aiGeneratedLocales ?? []}
    >
      <form action={formAction} className="flex flex-col gap-6">
        {mode === "edit" && initial ? (
          <input type="hidden" name="id" value={initial.id} />
        ) : null}

        {topError ? (
          <div className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {topError}
          </div>
        ) : null}

        <div className="flex flex-col gap-6">
          {infoCard}
          {heroCard}
          {seoCard}
        </div>
      </form>
    </TranslationStateProvider>
  )
}
