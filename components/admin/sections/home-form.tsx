"use client"

import { useTranslations } from "next-intl"

import { AdminTabs } from "@/components/admin/admin-tabs"
import { AdminCard, AdminField, AdminSelect } from "@/components/admin/admin-ui"
import { ImageField } from "@/components/admin/image-field"
import { LocalizedField } from "@/components/admin/localized-field"
import { RowTable } from "@/components/admin/row-table"
import { SectionForm, useSectionDraft } from "@/components/admin/section-form"
import { ServiceArtPicker } from "@/components/admin/service-art-picker"
import { SERVICE_ART } from "@/components/home/service-art"
import { saveHome } from "@/lib/actions/admin/home"
import type { HomeDraft, PricingDraft } from "@/lib/actions/admin/schemas"
import { FEATURE_ICONS, serviceIconAt } from "@/lib/home"
import { emptyLocalized } from "@/lib/localized"

type PricingKey = keyof PricingDraft

const PRICE_ROWS: { label: PricingKey; price: PricingKey }[] = [
  { label: "weekdaysLabel", price: "weekdaysPrice" },
  { label: "weekendLabel", price: "weekendPrice" },
  { label: "thirdGameLabel", price: "thirdGamePrice" },
]

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

  function pricingField(key: PricingKey, multiline = false) {
    const name = `pricing${key[0].toUpperCase()}${key.slice(1)}`
    return (
      <LocalizedField
        key={key}
        label={t(name)}
        tooltip={t(`${name}Tip`)}
        multiline={multiline}
        value={draft.pricing[key]}
        onChange={(value) =>
          setDraft((prev) => ({
            ...prev,
            pricing: { ...prev.pricing, [key]: value },
          }))
        }
      />
    )
  }

  const hero = (
    <>
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
          renderRow={(item, update) => (
            <>
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
            </>
          )}
        />
      </AdminCard>
    </>
  )

  const services = (
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
        value={draft.servicesIntro}
        onChange={(value) => set("servicesIntro", value)}
      />
      <RowTable
        items={draft.services}
        onChange={(items) => set("services", items)}
        createItem={() => ({
          title: emptyLocalized(),
          description: emptyLocalized(),
          icon: serviceIconAt("", draft.services.length),
          imageUrl: "",
        })}
        addLabel={t("addService")}
        columns={[
          {
            header: t("servicePicture"),
            cell: (item) => <ServicePreview {...item} />,
          },
          { header: t("serviceTitle"), cell: (item) => item.title.he || "—" },
        ]}
        renderRow={(item, update) => (
          <>
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
            <ServiceArtPicker
              label={t("serviceArt")}
              tooltip={t("serviceArtTip")}
              value={item.imageUrl ? "" : item.icon}
              onChange={(icon) => update({ ...item, icon, imageUrl: "" })}
            />
            <ImageField
              label={t("serviceImage")}
              tooltip={t("serviceImageTip")}
              value={item.imageUrl}
              onChange={(imageUrl) => update({ ...item, imageUrl })}
            />
          </>
        )}
      />
    </AdminCard>
  )

  const pricing = (
    <>
      <AdminCard title={t("pricingHeader")} description={t("pricingHint")}>
        {pricingField("eyebrow")}
        {pricingField("title")}
        {pricingField("description", true)}
      </AdminCard>

      <AdminCard title={t("pricingPrices")}>
        {PRICE_ROWS.map((row) => (
          <div key={row.label} className="grid gap-4 sm:grid-cols-2">
            {pricingField(row.label)}
            {pricingField(row.price)}
          </div>
        ))}
        {pricingField("thirdGameNote")}
        <div className="grid gap-4 sm:grid-cols-2">
          {pricingField("soldierTitle")}
          {pricingField("soldierNote")}
        </div>
      </AdminCard>

      <AdminCard title={t("pricingBirthday")}>
        {pricingField("birthdayEyebrow")}
        {pricingField("birthdayTitle")}
        {pricingField("birthdayDescription", true)}
        {pricingField("birthdayCtaLabel")}
      </AdminCard>
    </>
  )

  const galleryAndReviews = (
    <>
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
              cell: (item) => <Thumbnail url={item.imageUrl} />,
              className: "w-20",
            },
            { header: t("imageAlt"), cell: (item) => item.alt.he || "—" },
          ]}
          renderRow={(item, update) => (
            <>
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
            </>
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
    </>
  )

  const contact = (
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
        value={draft.contactIntro}
        onChange={(value) => set("contactIntro", value)}
      />
      <div>
        <h3 className="mb-2 text-sm font-medium">{t("subjects")}</h3>
        <RowTable
          items={draft.contactSubjects}
          onChange={(items) => set("contactSubjects", items)}
          createItem={() => ({ label: emptyLocalized() })}
          addLabel={t("addSubject")}
          columns={[
            { header: t("subjectLabel"), cell: (item) => item.label.he || "—" },
          ]}
          renderRow={(item, update) => (
            <LocalizedField
              label={t("subjectLabel")}
              tooltip={t("subjectLabelTip")}
              value={item.label}
              onChange={(label) => update({ ...item, label })}
            />
          )}
        />
      </div>
    </AdminCard>
  )

  return (
    <SectionForm
      slug={slug}
      title={t("title")}
      description={t("description")}
      draft={draft}
      onSave={(value) => saveHome(value)}
    >
      <AdminTabs
        tabs={[
          { value: "hero", label: t("tabHero"), content: hero },
          { value: "services", label: t("tabServices"), content: services },
          { value: "pricing", label: t("tabPricing"), content: pricing },
          {
            value: "gallery",
            label: t("tabGallery"),
            content: galleryAndReviews,
          },
          { value: "contact", label: t("tabContact"), content: contact },
        ]}
      />
    </SectionForm>
  )
}

function ServicePreview({ icon, imageUrl }: HomeDraft["services"][number]) {
  if (imageUrl) return <Thumbnail url={imageUrl} />
  const Art = SERVICE_ART[serviceIconAt(icon, 0)]
  return <Art className="h-10 w-auto" />
}

function Thumbnail({ url }: { url: string }) {
  if (!url) return <span className="text-muted-foreground">—</span>
  return (
    <span
      aria-hidden
      className="block h-10 w-14 rounded border border-border bg-cover bg-center"
      style={{ backgroundImage: `url(${JSON.stringify(url)})` }}
    />
  )
}
