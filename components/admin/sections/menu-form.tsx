"use client"

import { useLocale, useTranslations } from "next-intl"

import { AdminTabs } from "@/components/admin/admin-tabs"
import {
  AdminBadge,
  AdminCard,
  AdminField,
  AdminFlag,
  AdminInput,
  AdminSubsection,
} from "@/components/admin/admin-ui"
import { CollectionEditor } from "@/components/admin/collection-editor"
import { LocalizedField } from "@/components/admin/localized-field"
import { RowTable } from "@/components/admin/row-table"
import { SectionForm, useSectionDraft } from "@/components/admin/section-form"
import { saveMenu } from "@/lib/actions/admin/menu"
import type { MenuDraft, MenuItemDraft } from "@/lib/actions/admin/schemas"
import { parseWholeNumber } from "@/lib/admin/drafts"
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
  const [draft, setDraft] = useSectionDraft(initial)

  const categories = (
    <CollectionEditor
      items={draft.categories}
      onChange={(categories) => setDraft((prev) => ({ ...prev, categories }))}
      createItem={() => ({
        label: emptyLocalized(),
        isVisible: true,
        items: [],
      })}
      addLabel={t("addCategory")}
      emptyLabel={t("emptyCategories")}
      removeLabel={t("removeCategory")}
      removeMessage={t("removeCategoryMessage")}
      itemLabel={(category) => category.label.he}
      itemMeta={(category) => t("itemsCount", { count: category.items.length })}
      isHidden={(category) => !category.isVisible}
      renderDetail={(category, update) => (
        <>
          <AdminSubsection title={t("categoryDetails")}>
            <LocalizedField
              label={t("categoryLabel")}
              tooltip={t("categoryLabelTip")}
              value={category.label}
              onChange={(label) => update({ ...category, label })}
            />
            <AdminFlag
              label={common("visible")}
              description={common("visibleTip")}
              checked={category.isVisible}
              onCheckedChange={(isVisible) =>
                update({ ...category, isVisible })
              }
            />
          </AdminSubsection>
          <AdminSubsection title={t("items")}>
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
                  cell: (item) => (
                    <>
                      {item.name.he || "—"}
                      {!item.isVisible && (
                        <AdminBadge>{common("hidden")}</AdminBadge>
                      )}
                    </>
                  ),
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
              renderRow={(item, updateItem) => (
                <MenuItemEditor item={item} update={updateItem} />
              )}
            />
          </AdminSubsection>
        </>
      )}
    />
  )

  const pageTexts = (
    <AdminCard title={t("pageTexts")} description={t("pageTextsHint")}>
      <LocalizedField
        label={t("heading")}
        tooltip={t("headingTip")}
        value={draft.heading}
        onChange={(heading) => setDraft((prev) => ({ ...prev, heading }))}
      />
      <LocalizedField
        label={t("intro")}
        tooltip={t("introTip")}
        multiline
        value={draft.intro}
        onChange={(intro) => setDraft((prev) => ({ ...prev, intro }))}
      />
    </AdminCard>
  )

  return (
    <SectionForm
      slug={slug}
      title={t("title")}
      description={t("description")}
      draft={draft}
      onSave={(value) => saveMenu(value)}
    >
      <AdminTabs
        tabs={[
          { value: "items", label: t("tabItems"), content: categories },
          { value: "texts", label: t("tabTexts"), content: pageTexts },
        ]}
      />
    </SectionForm>
  )
}

function MenuItemEditor({
  item,
  update,
}: {
  item: MenuItemDraft
  update: (item: MenuItemDraft) => void
}) {
  const t = useTranslations("admin.menu")
  const common = useTranslations("admin.common")

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <LocalizedField
          label={t("itemName")}
          tooltip={t("itemNameTip")}
          value={item.name}
          onChange={(name) => update({ ...item, name })}
        />
        <AdminField label={t("itemAmount")} tooltip={t("itemAmountTip")}>
          <AdminInput
            type="number"
            min={0}
            step={1}
            dir="ltr"
            value={item.amount ?? ""}
            onChange={(event) =>
              update({ ...item, amount: parseWholeNumber(event.target.value) })
            }
          />
        </AdminField>
      </div>
      <LocalizedField
        label={t("itemDescription")}
        tooltip={t("itemDescriptionTip")}
        multiline
        rows={2}
        value={item.description}
        onChange={(description) => update({ ...item, description })}
      />
      <AdminFlag
        label={common("visible")}
        description={common("visibleTip")}
        checked={item.isVisible}
        onCheckedChange={(isVisible) => update({ ...item, isVisible })}
      />
    </>
  )
}
