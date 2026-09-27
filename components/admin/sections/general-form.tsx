"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import {
  AdminCard,
  AdminField,
  AdminFlag,
  AdminInput,
} from "@/components/admin/admin-ui"
import { HoursEditor } from "@/components/admin/hours-editor"
import { ImageField } from "@/components/admin/image-field"
import { LocalizedField } from "@/components/admin/localized-field"
import { SectionForm } from "@/components/admin/section-form"
import { saveGeneral } from "@/lib/actions/admin/general"
import type { GeneralDraft } from "@/lib/actions/admin/schemas"

export function GeneralForm({
  slug,
  initial,
}: {
  slug: string
  initial: GeneralDraft
}) {
  const t = useTranslations("admin.general")
  const [draft, setDraft] = useState(initial)

  function set<K extends keyof GeneralDraft>(key: K, value: GeneralDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
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
          tooltip={t("addressLine1Tip")}
          value={draft.addressLine1}
          onChange={(value) => set("addressLine1", value)}
        />
        <LocalizedField
          label={t("addressLine2")}
          tooltip={t("addressLine2Tip")}
          value={draft.addressLine2}
          onChange={(value) => set("addressLine2", value)}
        />
        <LocalizedField
          label={t("addressFull")}
          tooltip={t("addressFullTip")}
          value={draft.addressFull}
          onChange={(value) => set("addressFull", value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label={t("phone")} tooltip={t("phoneTip")}>
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
          <AdminField label={t("email")} tooltip={t("emailTip")}>
            <AdminInput
              dir="ltr"
              type="email"
              value={draft.email}
              onChange={(event) => set("email", event.target.value)}
            />
          </AdminField>
          <AdminField
            label={t("inquiriesEmail")}
            tooltip={t("inquiriesEmailTip")}
          >
            <AdminInput
              dir="ltr"
              type="email"
              value={draft.inquiriesEmail}
              onChange={(event) => set("inquiriesEmail", event.target.value)}
            />
          </AdminField>
          <AdminField label={t("wazeUrl")} tooltip={t("wazeUrlTip")}>
            <AdminInput
              dir="ltr"
              value={draft.wazeUrl}
              onChange={(event) => set("wazeUrl", event.target.value)}
            />
          </AdminField>
          <AdminField label={t("lanes")} tooltip={t("lanesTip")}>
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
          tooltip={t("laneDescTip")}
          value={draft.laneDesc}
          onChange={(value) => set("laneDesc", value)}
        />
        <ImageField
          label={t("logoUrl")}
          tooltip={t("logoUrlTip")}
          value={draft.logoUrl}
          onChange={(value) => set("logoUrl", value)}
        />
      </AdminCard>

      <AdminCard title={t("hours")} description={t("hoursTip")}>
        <HoursEditor
          value={draft.hours}
          onChange={(value) => set("hours", value)}
        />
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
              tooltip={t("noticeTitleTip")}
              value={draft.noticeTitle}
              onChange={(value) => set("noticeTitle", value)}
            />
            <LocalizedField
              label={t("noticeBody")}
              tooltip={t("noticeBodyTip")}
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
          tooltip={t("contactTitleTip")}
          value={draft.contactTitle}
          onChange={(value) => set("contactTitle", value)}
        />
        <LocalizedField
          label={t("contactIntro")}
          tooltip={t("contactIntroTip")}
          multiline
          value={draft.contactIntro}
          onChange={(value) => set("contactIntro", value)}
        />
        <LocalizedField
          label={t("footerNote")}
          tooltip={t("footerNoteTip")}
          multiline
          value={draft.footerNote}
          onChange={(value) => set("footerNote", value)}
        />
      </AdminCard>

      <AdminCard title={t("seo")}>
        <LocalizedField
          label={t("seoTitle")}
          tooltip={t("seoTitleTip")}
          value={draft.seoTitle}
          onChange={(value) => set("seoTitle", value)}
        />
        <LocalizedField
          label={t("seoDescription")}
          tooltip={t("seoDescriptionTip")}
          multiline
          value={draft.seoDescription}
          onChange={(value) => set("seoDescription", value)}
        />
      </AdminCard>
    </SectionForm>
  )
}
