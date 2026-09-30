"use client"

import { useTranslations } from "next-intl"

import {
  AdminBadge,
  AdminCard,
  AdminField,
  AdminFlag,
  AdminInput,
} from "@/components/admin/admin-ui"
import { LocalizedField } from "@/components/admin/localized-field"
import { RowTable } from "@/components/admin/row-table"
import { SectionForm, useSectionDraft } from "@/components/admin/section-form"
import { saveLocations } from "@/lib/actions/admin/locations"
import type { LocationsDraft } from "@/lib/actions/admin/schemas"
import { toSlug } from "@/lib/admin/slug"
import { emptyLocalized } from "@/lib/localized"

export function LocationsForm({ initial }: { initial: LocationsDraft }) {
  const t = useTranslations("admin.locations")
  const common = useTranslations("admin.common")
  const [draft, setDraft] = useSectionDraft(initial)

  return (
    <SectionForm
      slug="locations"
      title={t("title")}
      description={t("description")}
      draft={draft}
      onSave={(value) => saveLocations(value)}
    >
      <AdminCard>
        <RowTable
          items={draft.locations}
          onChange={(locations) => setDraft({ locations })}
          createItem={() => ({
            slug: "",
            name: emptyLocalized(),
            isVisible: true,
          })}
          addLabel={t("add")}
          columns={[
            {
              header: t("name"),
              cell: (item) => (
                <>
                  {item.name.he || "—"}
                  {!item.isVisible && (
                    <AdminBadge>{common("hidden")}</AdminBadge>
                  )}
                </>
              ),
            },
          ]}
          renderRow={(item, update) => (
            <>
              <LocalizedField
                label={t("name")}
                tooltip={t("nameTip")}
                value={item.name}
                onChange={(name) => update({ ...item, name })}
              />
              {!item.id && (
                <AdminField label={t("slug")} tooltip={t("slugTip")}>
                  <AdminInput
                    dir="ltr"
                    placeholder="ramat-gan"
                    value={item.slug}
                    onChange={(event) =>
                      update({ ...item, slug: toSlug(event.target.value) })
                    }
                  />
                </AdminField>
              )}
              <AdminFlag
                label={common("visible")}
                description={t("visibleTip")}
                checked={item.isVisible}
                onCheckedChange={(isVisible) => update({ ...item, isVisible })}
              />
            </>
          )}
        />
      </AdminCard>
    </SectionForm>
  )
}
