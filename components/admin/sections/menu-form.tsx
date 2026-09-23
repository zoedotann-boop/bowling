"use client"

import { useLocale, useTranslations } from "next-intl"
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
import { saveMenu } from "@/lib/actions/admin/menu"
import type { MenuDraft, MenuItemDraft } from "@/lib/actions/admin/schemas"
import { emptyLocalized, formatPrice } from "@/lib/localized"
import type { Locale } from "@/lib/locales"

export function MenuForm({
  slug,
  initial,
}: {
  slug: string
  initial: MenuDraft
}) {
  const t = useTranslations("admin.menu")
  const common = useTranslations("admin.common")
  const locale = useLocale() as Locale
  const [draft, setDraft] = useState(initial)

  function itemEditor(
    item: MenuItemDraft,
    update: (item: MenuItemDraft) => void
  ) {
    return (
      <div className="space-y-4">
        <LocalizedField
          label={t("itemName")}
          value={item.name}
          onChange={(name) => update({ ...item, name })}
        />
        <LocalizedField
          label={t("itemDescription")}
          multiline
          value={item.description}
          onChange={(description) => update({ ...item, description })}
        />
        <AdminField label={t("itemAmount")} tooltip={t("itemAmountTip")}>
          <AdminInput
            type="number"
            min={0}
            dir="ltr"
            value={item.amount ?? ""}
            onChange={(event) =>
              update({
                ...item,
                amount:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
          />
        </AdminField>
        <AdminFlag
          label={common("visible")}
          checked={item.isVisible}
          onCheckedChange={(isVisible) => update({ ...item, isVisible })}
        />
      </div>
    )
  }

  return (
    <SectionForm
      slug={slug}
      title={t("title")}
      draft={draft}
      onSave={(value) => saveMenu(value)}
    >
      <AdminCard title={t("heading")}>
        <LocalizedField
          label={t("heading")}
          tooltip={t("headingTip")}
          value={draft.heading}
          onChange={(heading) => setDraft((prev) => ({ ...prev, heading }))}
        />
        <LocalizedField
          label={t("intro")}
          multiline
          value={draft.intro}
          onChange={(intro) => setDraft((prev) => ({ ...prev, intro }))}
        />
      </AdminCard>

      <AdminCard title={t("categories")}>
        <RowTable
          items={draft.categories}
          onChange={(categories) =>
            setDraft((prev) => ({ ...prev, categories }))
          }
          createItem={() => ({
            label: emptyLocalized(),
            isVisible: true,
            items: [],
          })}
          addLabel={t("addCategory")}
          columns={[
            {
              header: t("categoryLabel"),
              cell: (item) => item.label.he || "—",
            },
            {
              header: t("itemsCount"),
              cell: (item) => item.items.length,
              className: "w-16",
            },
          ]}
          editTitle={(item) => item.label.he || t("categoryLabel")}
          renderRow={(category, index, update) => (
            <div className="space-y-4">
              <LocalizedField
                label={t("categoryLabel")}
                tooltip={t("categoryLabelTip")}
                value={category.label}
                onChange={(label) => update({ ...category, label })}
              />
              <AdminFlag
                label={common("visible")}
                checked={category.isVisible}
                onCheckedChange={(isVisible) =>
                  update({ ...category, isVisible })
                }
              />
              <div>
                <h3 className="mb-2 text-sm font-medium">{t("items")}</h3>
                <RowTable
                  items={category.items}
                  onChange={(items) => update({ ...category, items })}
                  createItem={() => ({
                    name: emptyLocalized(),
                    description: emptyLocalized(),
                    amount: null,
                    isVisible: true,
                  })}
                  addLabel={t("addItem")}
                  columns={[
                    {
                      header: t("itemName"),
                      cell: (item) => item.name.he || "—",
                    },
                    {
                      header: t("itemAmount"),
                      cell: (item) =>
                        item.amount === null
                          ? "—"
                          : formatPrice(item.amount, locale),
                      className: "w-24",
                    },
                  ]}
                  editTitle={(item) => item.name.he || t("itemName")}
                  renderRow={(item, itemIndex, updateItem) =>
                    itemEditor(item, updateItem)
                  }
                />
              </div>
            </div>
          )}
        />
      </AdminCard>
    </SectionForm>
  )
}
