"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { AdminCard, AdminField, AdminInput } from "@/components/admin/admin-ui"
import { ImageField } from "@/components/admin/image-field"
import { LocalizedField } from "@/components/admin/localized-field"
import { RowTable } from "@/components/admin/row-table"
import { SectionForm } from "@/components/admin/section-form"
import { saveHome } from "@/lib/actions/admin/home"
import type { HomeDraft } from "@/lib/actions/admin/schemas"
import { emptyLocalized } from "@/lib/localized"

export function HomeForm({
  slug,
  initial,
}: {
  slug: string
  initial: HomeDraft
}) {
  const t = useTranslations("admin.home")
  const [draft, setDraft] = useState(initial)

  function set<K extends keyof HomeDraft>(key: K, value: HomeDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
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
          value={draft.heroTitle}
          onChange={(value) => set("heroTitle", value)}
        />
        <LocalizedField
          label={t("heroSubtitle")}
          multiline
          value={draft.heroSubtitle}
          onChange={(value) => set("heroSubtitle", value)}
        />
        <LocalizedField
          label={t("heroCtaLabel")}
          value={draft.heroCtaLabel}
          onChange={(value) => set("heroCtaLabel", value)}
        />
      </AdminCard>

      <AdminCard title={t("features")}>
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
                <AdminInput
                  dir="ltr"
                  value={item.icon}
                  onChange={(event) =>
                    update({ ...item, icon: event.target.value })
                  }
                />
              </AdminField>
              <LocalizedField
                label={t("featureLabel")}
                value={item.label}
                onChange={(label) => update({ ...item, label })}
              />
              <LocalizedField
                label={t("featureDescription")}
                multiline
                value={item.description}
                onChange={(description) => update({ ...item, description })}
              />
            </div>
          )}
        />
      </AdminCard>

      <AdminCard title={t("services")}>
        <LocalizedField
          label={t("servicesTitle")}
          value={draft.servicesTitle}
          onChange={(value) => set("servicesTitle", value)}
        />
        <LocalizedField
          label={t("servicesIntro")}
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
                value={item.title}
                onChange={(title) => update({ ...item, title })}
              />
              <LocalizedField
                label={t("serviceDescription")}
                multiline
                value={item.description}
                onChange={(description) => update({ ...item, description })}
              />
              <ImageField
                label={t("serviceImage")}
                value={item.imageUrl}
                onChange={(imageUrl) => update({ ...item, imageUrl })}
              />
            </div>
          )}
        />
      </AdminCard>

      <AdminCard title={t("gallery")}>
        <LocalizedField
          label={t("galleryTitle")}
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

      <AdminCard title={t("reviews")}>
        <LocalizedField
          label={t("reviewsTitle")}
          value={draft.reviewsTitle}
          onChange={(value) => set("reviewsTitle", value)}
        />
        <RowTable
          items={draft.reviews}
          onChange={(items) => set("reviews", items)}
          createItem={() => ({
            author: emptyLocalized(),
            quote: emptyLocalized(),
            rating: 5,
          })}
          addLabel={t("addReview")}
          columns={[
            {
              header: t("reviewAuthor"),
              cell: (item) => item.author.he || "—",
            },
            {
              header: t("reviewRating"),
              cell: (item) => "★".repeat(item.rating),
              className: "w-24",
            },
          ]}
          editTitle={() => t("reviewEditTitle")}
          renderRow={(item, index, update) => (
            <div className="space-y-4">
              <LocalizedField
                label={t("reviewAuthor")}
                value={item.author}
                onChange={(author) => update({ ...item, author })}
              />
              <LocalizedField
                label={t("reviewQuote")}
                multiline
                value={item.quote}
                onChange={(quote) => update({ ...item, quote })}
              />
              <AdminField label={t("reviewRating")}>
                <AdminInput
                  type="number"
                  min={1}
                  max={5}
                  value={item.rating}
                  onChange={(event) =>
                    update({
                      ...item,
                      rating: Math.min(
                        5,
                        Math.max(1, Number(event.target.value) || 1)
                      ),
                    })
                  }
                />
              </AdminField>
            </div>
          )}
        />
      </AdminCard>

      <AdminCard title={t("contact")}>
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
              value={item.label}
              onChange={(label) => update({ ...item, label })}
            />
          )}
        />
      </AdminCard>
    </SectionForm>
  )
}
