"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import {
  AdminCard,
  AdminField,
  AdminFlag,
  AdminInput,
} from "@/components/admin/admin-ui"
import { LocalizedField } from "@/components/admin/localized-field"
import { RowTable } from "@/components/admin/row-table"
import { SectionForm } from "@/components/admin/section-form"
import { saveLocations } from "@/lib/actions/admin/locations"
import type { LocationsDraft } from "@/lib/actions/admin/schemas"
import { emptyLocalized } from "@/lib/localized"

export function LocationsForm({ initial }: { initial: LocationsDraft }) {
  const t = useTranslations("admin.locations")
  const common = useTranslations("admin.common")
  const [draft, setDraft] = useState(initial)

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
            { header: t("name"), cell: (item) => item.name.he || "—" },
            {
              header: t("slug"),
              cell: (item) => item.slug || "—",
              className: "font-mono text-xs",
            },
          ]}
          editTitle={(item) => item.name.he || t("add")}
          renderRow={(item, index, update) => (
            <div className="space-y-4">
              <AdminField label={t("slug")} tooltip={t("slugTip")}>
                <AdminInput
                  dir="ltr"
                  value={item.slug}
                  onChange={(event) =>
                    update({ ...item, slug: event.target.value })
                  }
                />
              </AdminField>
              <LocalizedField
                label={t("name")}
                value={item.name}
                onChange={(name) => update({ ...item, name })}
              />
              <AdminFlag
                label={common("visible")}
                checked={item.isVisible}
                onCheckedChange={(isVisible) => update({ ...item, isVisible })}
              />
            </div>
          )}
        />
      </AdminCard>
    </SectionForm>
  )
}
