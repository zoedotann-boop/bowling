"use client"

import { useTranslations } from "next-intl"

import { AdminCard, AdminField, AdminSelect } from "@/components/admin/admin-ui"
import { ImageField } from "@/components/admin/image-field"
import { LocalizedField } from "@/components/admin/localized-field"
import { RowTable } from "@/components/admin/row-table"
import { SectionForm, useSectionDraft } from "@/components/admin/section-form"
import { saveHome } from "@/lib/actions/admin/home"
import type { HomeDraft } from "@/lib/actions/admin/schemas"
import { FEATURE_ICONS } from "@/lib/home"
import { emptyLocalized } from "@/lib/localized"

export function HomeForm({
  slug,
  initial,
}: {
  slug: string
  initial: HomeDraft
}) {
  const t = useTranslations("admin.home")
  const [draft, setDraft] = useSectionDraft(initial)

  function set<K extends keyof HomeDraft>(key: K, value: HomeDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function setPricing<K extends keyof HomeDraft["pricing"]>(
    key: K,
    value: HomeDraft["pricing"][K]
  ) {
    setDraft((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [key]: value },
    }))
  }

  return (
    <SectionForm
      slug={slug}
      title={t("title")}
      draft={draft}
      onSave={(value) => saveHome(value)}
    >
      <AdminCard title={t("hero")}>
        <LocalizedField
          label={t("heroTitle")}
          tooltip={t("heroTitleTip")}
          value={draft.heroTitle}
          onChange={(value) => set("heroTitle", value)}
        />
        <LocalizedField
          label={t("heroSubtitle")}
          tooltip={t("heroSubtitleTip")}
          multiline
          value={draft.heroSubtitle}
          onChange={(value) => set("heroSubtitle", value)}
        />
        <LocalizedField
          label={t("heroCtaLabel")}
          tooltip={t("heroCtaLabelTip")}
          value={draft.heroCtaLabel}
          onChange={(value) => set("heroCtaLabel", value)}
        />
      </AdminCard>

      <AdminCard title={t("features")} description={t("featuresTip")}>
        <RowTable
          items={draft.features}
          onChange={(items) => set("features", items)}
          createItem={() => ({
            icon: "",
            label: emptyLocalized(),
            description: emptyLocalized(),
          })}
          addLabel={t("addFeature")}
          columns={[
            { header: t("featureLabel"), cell: (item) => item.label.he || "—" },
          ]}
          editTitle={() => t("featureTitle")}
          renderRow={(item, index, update) => (
            <div className="space-y-4">
              <AdminField
                label={t("featureIcon")}
                tooltip={t("featureIconTip")}
              >
                <AdminSelect
                  value={item.icon}
                  onChange={(event) =>
                    update({ ...item, icon: event.target.value })
                  }
                >
                  <option value="">{t("featureIconOption.auto")}</option>
                  {FEATURE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {t(`featureIconOption.${icon}`)}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>
              <LocalizedField
                label={t("featureLabel")}
                tooltip={t("featureLabelTip")}
                value={item.label}
                onChange={(label) => update({ ...item, label })}
              />
              <LocalizedField
                label={t("featureDescription")}
                tooltip={t("featureDescriptionTip")}
                multiline
                value={item.description}
                onChange={(description) => update({ ...item, description })}
              />
            </div>
          )}
        />
      </AdminCard>

      <AdminCard title={t("services")} description={t("servicesTip")}>
        <LocalizedField
          label={t("servicesTitle")}
          tooltip={t("servicesTitleTip")}
          value={draft.servicesTitle}
          onChange={(value) => set("servicesTitle", value)}
        />
        <LocalizedField
          label={t("servicesIntro")}
          tooltip={t("servicesIntroTip")}
          multiline
          value={draft.servicesIntro}
          onChange={(value) => set("servicesIntro", value)}
        />
        <RowTable
          items={draft.services}
          onChange={(items) => set("services", items)}
          createItem={() => ({
            title: emptyLocalized(),
            description: emptyLocalized(),
            imageUrl: "",
          })}
          addLabel={t("addService")}
          columns={[
            { header: t("serviceTitle"), cell: (item) => item.title.he || "—" },
          ]}
          editTitle={() => t("serviceEditTitle")}
          renderRow={(item, index, update) => (
            <div className="space-y-4">
              <LocalizedField
                label={t("serviceTitle")}
                tooltip={t("serviceTitleTip")}
                value={item.title}
                onChange={(title) => update({ ...item, title })}
              />
              <LocalizedField
                label={t("serviceDescription")}
                tooltip={t("serviceDescriptionTip")}
                multiline
                value={item.description}
                onChange={(description) => update({ ...item, description })}
              />
              <ImageField
                label={t("serviceImage")}
                tooltip={t("serviceImageTip")}
                value={item.imageUrl}
                onChange={(imageUrl) => update({ ...item, imageUrl })}
              />
            </div>
          )}
        />
      </AdminCard>

      <AdminCard title={t("pricing")} description={t("pricingHint")}>
        <LocalizedField
          label={t("pricingEyebrow")}
          tooltip={t("pricingEyebrowTip")}
          value={draft.pricing.eyebrow}
          onChange={(value) => setPricing("eyebrow", value)}
        />
        <LocalizedField
          label={t("pricingTitle")}
          tooltip={t("pricingTitleTip")}
          value={draft.pricing.title}
          onChange={(value) => setPricing("title", value)}
        />
        <LocalizedField
          label={t("pricingDescription")}
          tooltip={t("pricingDescriptionTip")}
          multiline
          value={draft.pricing.description}
          onChange={(value) => setPricing("description", value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <LocalizedField
            label={t("pricingWeekdaysLabel")}
            tooltip={t("pricingWeekdaysLabelTip")}
            value={draft.pricing.weekdaysLabel}
            onChange={(value) => setPricing("weekdaysLabel", value)}
          />
          <LocalizedField
            label={t("pricingWeekdaysPrice")}
            tooltip={t("pricingWeekdaysPriceTip")}
            value={draft.pricing.weekdaysPrice}
            onChange={(value) => setPricing("weekdaysPrice", value)}
          />
          <LocalizedField
            label={t("pricingWeekendLabel")}
            tooltip={t("pricingWeekendLabelTip")}
            value={draft.pricing.weekendLabel}
            onChange={(value) => setPricing("weekendLabel", value)}
          />
          <LocalizedField
            label={t("pricingWeekendPrice")}
            tooltip={t("pricingWeekendPriceTip")}
            value={draft.pricing.weekendPrice}
            onChange={(value) => setPricing("weekendPrice", value)}
          />
          <LocalizedField
            label={t("pricingThirdGameLabel")}
            tooltip={t("pricingThirdGameLabelTip")}
            value={draft.pricing.thirdGameLabel}
            onChange={(value) => setPricing("thirdGameLabel", value)}
          />
          <LocalizedField
            label={t("pricingThirdGamePrice")}
            tooltip={t("pricingThirdGamePriceTip")}
            value={draft.pricing.thirdGamePrice}
            onChange={(value) => setPricing("thirdGamePrice", value)}
          />
        </div>
        <LocalizedField
          label={t("pricingThirdGameNote")}
          tooltip={t("pricingThirdGameNoteTip")}
          value={draft.pricing.thirdGameNote}
          onChange={(value) => setPricing("thirdGameNote", value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <LocalizedField
            label={t("pricingSoldierTitle")}
            tooltip={t("pricingSoldierTitleTip")}
            value={draft.pricing.soldierTitle}
            onChange={(value) => setPricing("soldierTitle", value)}
          />
          <LocalizedField
            label={t("pricingSoldierNote")}
            tooltip={t("pricingSoldierNoteTip")}
            value={draft.pricing.soldierNote}
            onChange={(value) => setPricing("soldierNote", value)}
          />
        </div>
        <LocalizedField
          label={t("pricingBirthdayEyebrow")}
          tooltip={t("pricingBirthdayEyebrowTip")}
          value={draft.pricing.birthdayEyebrow}
          onChange={(value) => setPricing("birthdayEyebrow", value)}
        />
        <LocalizedField
          label={t("pricingBirthdayTitle")}
          tooltip={t("pricingBirthdayTitleTip")}
          value={draft.pricing.birthdayTitle}
          onChange={(value) => setPricing("birthdayTitle", value)}
        />
        <LocalizedField
          label={t("pricingBirthdayDescription")}
          tooltip={t("pricingBirthdayDescriptionTip")}
          multiline
          value={draft.pricing.birthdayDescription}
          onChange={(value) => setPricing("birthdayDescription", value)}
        />
        <LocalizedField
          label={t("pricingBirthdayCtaLabel")}
          tooltip={t("pricingBirthdayCtaLabelTip")}
          value={draft.pricing.birthdayCtaLabel}
          onChange={(value) => setPricing("birthdayCtaLabel", value)}
        />
      </AdminCard>

      <AdminCard title={t("gallery")}>
        <LocalizedField
          label={t("galleryTitle")}
          tooltip={t("galleryTitleTip")}
          value={draft.galleryTitle}
          onChange={(value) => set("galleryTitle", value)}
        />
        <RowTable
          items={draft.gallery}
          onChange={(items) => set("gallery", items)}
          createItem={() => ({ imageUrl: "", alt: emptyLocalized() })}
          addLabel={t("addImage")}
          columns={[
            {
              header: t("imageUrl"),
              cell: (item) => item.imageUrl || "—",
              className: "font-mono text-xs",
            },
          ]}
          editTitle={() => t("imageEditTitle")}
          renderRow={(item, index, update) => (
            <div className="space-y-4">
              <ImageField
                label={t("imageUrl")}
                tooltip={t("imageUrlTip")}
                value={item.imageUrl}
                onChange={(imageUrl) => update({ ...item, imageUrl })}
              />
              <LocalizedField
                label={t("imageAlt")}
                tooltip={t("imageAltTip")}
                value={item.alt}
                onChange={(alt) => update({ ...item, alt })}
              />
            </div>
          )}
        />
      </AdminCard>

      <AdminCard title={t("reviews")} description={t("reviewsDescription")}>
        <LocalizedField
          label={t("reviewsTitle")}
          tooltip={t("reviewsTitleTip")}
          value={draft.reviewsTitle}
          onChange={(value) => set("reviewsTitle", value)}
        />
      </AdminCard>

      <AdminCard title={t("contact")}>
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
        <RowTable
          items={draft.contactSubjects}
          onChange={(items) => set("contactSubjects", items)}
          createItem={() => ({ label: emptyLocalized() })}
          addLabel={t("addSubject")}
          columns={[
            { header: t("subjectLabel"), cell: (item) => item.label.he || "—" },
          ]}
          editTitle={() => t("subjectEditTitle")}
          renderRow={(item, index, update) => (
            <LocalizedField
              label={t("subjectLabel")}
              tooltip={t("subjectLabelTip")}
              value={item.label}
              onChange={(label) => update({ ...item, label })}
            />
          )}
        />
      </AdminCard>
    </SectionForm>
  )
}
