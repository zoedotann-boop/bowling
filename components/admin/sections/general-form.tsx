"use client"

import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import {
  AdminCard,
  AdminField,
  AdminFlag,
  AdminInput,
} from "@/components/admin/admin-ui"
import { ImageField } from "@/components/admin/image-field"
import { LocalizedField } from "@/components/admin/localized-field"
import { SectionForm } from "@/components/admin/section-form"
import { saveGeneral } from "@/lib/actions/admin/general"
import type { GeneralDraft } from "@/lib/actions/admin/schemas"
import type { Locale } from "@/lib/locales"

function weekdayLabel(day: number, locale: Locale): string {
  const date = new Date(Date.UTC(2024, 0, 7 + day)) // 2024-01-07 is a Sunday
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date)
}

export function GeneralForm({
  slug,
  initial,
}: {
  slug: string
  initial: GeneralDraft
}) {
  const t = useTranslations("admin.general")
  const locale = useLocale() as Locale
  const [draft, setDraft] = useState(initial)

  function set<K extends keyof GeneralDraft>(key: K, value: GeneralDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function setHours(
    day: number,
    patch: Partial<GeneralDraft["hours"][number]>
  ) {
    setDraft((prev) => ({
      ...prev,
      hours: prev.hours.map((entry) =>
        entry.day === day ? { ...entry, ...patch } : entry
      ),
    }))
  }

  return (
    <SectionForm
      slug={slug}
      title={t("title")}
      draft={draft}
      onSave={(value) => saveGeneral(value)}
    >
      <AdminCard title={t("contact")}>
        <LocalizedField
          label={t("name")}
          tooltip={t("nameTip")}
          value={draft.name}
          onChange={(value) => set("name", value)}
        />
        <LocalizedField
          label={t("addressLine1")}
          value={draft.addressLine1}
          onChange={(value) => set("addressLine1", value)}
        />
        <LocalizedField
          label={t("addressLine2")}
          value={draft.addressLine2}
          onChange={(value) => set("addressLine2", value)}
        />
        <LocalizedField
          label={t("addressFull")}
          value={draft.addressFull}
          onChange={(value) => set("addressFull", value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label={t("phone")}>
            <AdminInput
              dir="ltr"
              value={draft.phone}
              onChange={(event) => set("phone", event.target.value)}
            />
          </AdminField>
          <AdminField label={t("whatsapp")} tooltip={t("whatsappTip")}>
            <AdminInput
              dir="ltr"
              value={draft.whatsapp}
              onChange={(event) => set("whatsapp", event.target.value)}
            />
          </AdminField>
          <AdminField label={t("email")}>
            <AdminInput
              dir="ltr"
              type="email"
              value={draft.email}
              onChange={(event) => set("email", event.target.value)}
            />
          </AdminField>
          <AdminField label={t("wazeUrl")}>
            <AdminInput
              dir="ltr"
              value={draft.wazeUrl}
              onChange={(event) => set("wazeUrl", event.target.value)}
            />
          </AdminField>
          <AdminField label={t("lanes")}>
            <AdminInput
              type="number"
              min={0}
              value={draft.lanes}
              onChange={(event) =>
                set("lanes", Number(event.target.value) || 0)
              }
            />
          </AdminField>
        </div>
        <LocalizedField
          label={t("laneDesc")}
          value={draft.laneDesc}
          onChange={(value) => set("laneDesc", value)}
        />
        <ImageField
          label={t("logoUrl")}
          value={draft.logoUrl}
          onChange={(value) => set("logoUrl", value)}
        />
      </AdminCard>

      <AdminCard title={t("hours")} description={t("hoursTip")}>
        <div className="space-y-1.5">
          {draft.hours.map((entry) => (
            <div
              key={entry.day}
              className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-1.5"
            >
              <span className="w-24 text-sm">
                {weekdayLabel(entry.day, locale)}
              </span>
              <AdminFlag
                label={t("closed")}
                checked={entry.closed}
                onCheckedChange={(closed) => setHours(entry.day, { closed })}
              />
              {!entry.closed && (
                <div className="flex items-center gap-2">
                  <AdminInput
                    type="time"
                    className="w-32"
                    value={entry.open ?? ""}
                    onChange={(event) =>
                      setHours(entry.day, { open: event.target.value })
                    }
                  />
                  <span className="text-muted-foreground">–</span>
                  <AdminInput
                    type="time"
                    className="w-32"
                    value={entry.close ?? ""}
                    onChange={(event) =>
                      setHours(entry.day, { close: event.target.value })
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title={t("notice")}>
        <AdminFlag
          label={t("hasNotice")}
          description={t("hasNoticeTip")}
          checked={draft.hasNotice}
          onCheckedChange={(value) => set("hasNotice", value)}
        />
        <AdminFlag
          label={t("hasGymboree")}
          description={t("hasGymboreeTip")}
          checked={draft.hasGymboree}
          onCheckedChange={(value) => set("hasGymboree", value)}
        />
        {draft.hasNotice && (
          <>
            <LocalizedField
              label={t("noticeTitle")}
              value={draft.noticeTitle}
              onChange={(value) => set("noticeTitle", value)}
            />
            <LocalizedField
              label={t("noticeBody")}
              multiline
              value={draft.noticeBody}
              onChange={(value) => set("noticeBody", value)}
            />
          </>
        )}
      </AdminCard>

      <AdminCard title={t("siteChrome")}>
        <LocalizedField
          label={t("contactTitle")}
          value={draft.contactTitle}
          onChange={(value) => set("contactTitle", value)}
        />
        <LocalizedField
          label={t("contactIntro")}
          multiline
          value={draft.contactIntro}
          onChange={(value) => set("contactIntro", value)}
        />
        <LocalizedField
          label={t("footerNote")}
          multiline
          value={draft.footerNote}
          onChange={(value) => set("footerNote", value)}
        />
      </AdminCard>

      <AdminCard title={t("seo")}>
        <LocalizedField
          label={t("seoTitle")}
          value={draft.seoTitle}
          onChange={(value) => set("seoTitle", value)}
        />
        <LocalizedField
          label={t("seoDescription")}
          multiline
          value={draft.seoDescription}
          onChange={(value) => set("seoDescription", value)}
        />
      </AdminCard>
    </SectionForm>
  )
}
