"use client"

import { useTranslations } from "next-intl"

import { AdminTabs } from "@/components/admin/admin-tabs"
import {
  AdminCard,
  AdminField,
  AdminFlag,
  AdminInput,
} from "@/components/admin/admin-ui"
import { HoursEditor } from "@/components/admin/hours-editor"
import { ImageField } from "@/components/admin/image-field"
import { LocalizedField } from "@/components/admin/localized-field"
import { SectionForm, useSectionDraft } from "@/components/admin/section-form"
import { saveGeneral } from "@/lib/actions/admin/general"
import type { GeneralDraft } from "@/lib/actions/admin/schemas"
import { parseWholeNumber } from "@/lib/admin/drafts"

type TextKey = "phone" | "whatsapp" | "email" | "inquiriesEmail" | "wazeUrl"

export function GeneralForm({
  slug,
  canEditSeo,
  initial,
}: {
  slug: string
  canEditSeo: boolean
  initial: GeneralDraft
}) {
  const t = useTranslations("admin.general")
  const [draft, setDraft] = useSectionDraft(initial)

  function set<K extends keyof GeneralDraft>(key: K, value: GeneralDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function textField(key: TextKey, type = "text") {
    return (
      <AdminField label={t(key)} tooltip={t(`${key}Tip`)}>
        <AdminInput
          dir="ltr"
          type={type}
          value={draft[key]}
          onChange={(event) => set(key, event.target.value)}
        />
      </AdminField>
    )
  }

  const details = (
    <AdminCard title={t("details")}>
      <LocalizedField
        label={t("name")}
        tooltip={t("nameTip")}
        value={draft.name}
        onChange={(value) => set("name", value)}
      />
      <LocalizedField
        label={t("addressFull")}
        tooltip={t("addressFullTip")}
        value={draft.addressFull}
        onChange={(value) => set("addressFull", value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label={t("lanes")} tooltip={t("lanesTip")}>
          <AdminInput
            type="number"
            min={0}
            value={draft.lanes}
            onChange={(event) =>
              set(
                "lanes",
                Math.max(0, parseWholeNumber(event.target.value) ?? 0)
              )
            }
          />
        </AdminField>
      </div>
      <ImageField
        label={t("logoUrl")}
        tooltip={t("logoUrlTip")}
        value={draft.logoUrl}
        onChange={(value) => set("logoUrl", value)}
      />
    </AdminCard>
  )

  const contact = (
    <AdminCard title={t("contact")}>
      <div className="grid gap-4 sm:grid-cols-2">
        {textField("phone", "tel")}
        {textField("whatsapp", "tel")}
        {textField("email", "email")}
        {textField("inquiriesEmail", "email")}
      </div>
      {textField("wazeUrl")}
    </AdminCard>
  )

  const hours = (
    <AdminCard title={t("hours")} description={t("hoursTip")}>
      <HoursEditor
        value={draft.hours}
        onChange={(value) => set("hours", value)}
      />
    </AdminCard>
  )

  const display = (
    <>
      <AdminCard title={t("notice")}>
        <AdminFlag
          label={t("hasNotice")}
          description={t("hasNoticeTip")}
          checked={draft.hasNotice}
          onCheckedChange={(value) => set("hasNotice", value)}
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

      <AdminCard title={t("siteDisplay")}>
        <AdminFlag
          label={t("hasGymboree")}
          description={t("hasGymboreeTip")}
          checked={draft.hasGymboree}
          onCheckedChange={(value) => set("hasGymboree", value)}
        />
        <LocalizedField
          label={t("footerNote")}
          tooltip={t("footerNoteTip")}
          multiline
          value={draft.footerNote}
          onChange={(value) => set("footerNote", value)}
        />
      </AdminCard>
    </>
  )

  const seo = (
    <AdminCard title={t("seo")} description={t("seoHint")}>
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
  )

  return (
    <SectionForm
      slug={slug}
      title={t("title")}
      description={t("description")}
      draft={draft}
      onSave={(value) => saveGeneral(value)}
    >
      <AdminTabs
        tabs={[
          { value: "details", label: t("tabDetails"), content: details },
          { value: "contact", label: t("tabContact"), content: contact },
          { value: "hours", label: t("tabHours"), content: hours },
          { value: "display", label: t("tabDisplay"), content: display },
          ...(canEditSeo
            ? [{ value: "seo", label: t("tabSeo"), content: seo }]
            : []),
        ]}
      />
    </SectionForm>
  )
}
