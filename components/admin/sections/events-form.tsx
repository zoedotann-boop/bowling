"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import {
  AdminCard,
  AdminField,
  AdminFlag,
  AdminInput,
  AdminSelect,
} from "@/components/admin/admin-ui"
import { LocalizedField } from "@/components/admin/localized-field"
import { RowTable } from "@/components/admin/row-table"
import { SectionForm } from "@/components/admin/section-form"
import { saveEvents } from "@/lib/actions/admin/events"
import type {
  EventFormFieldDraft,
  EventsDraft,
  EventTypeDraft,
} from "@/lib/actions/admin/schemas"
import { FORM_FIELD_TYPES } from "@/lib/events/fields"
import { emptyLocalized } from "@/lib/localized"

// A whole-number field that maps "" ↔ null.
function MoneyField({
  label,
  tooltip,
  value,
  onChange,
}: {
  label: string
  tooltip?: string
  value: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <AdminField label={label} tooltip={tooltip}>
      <AdminInput
        type="number"
        min={0}
        dir="ltr"
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value === "" ? null : Number(event.target.value)
          )
        }
      />
    </AdminField>
  )
}

export function EventsForm({
  slug,
  initial,
}: {
  slug: string
  initial: EventsDraft
}) {
  const t = useTranslations("admin.events")
  const common = useTranslations("admin.common")
  const [draft, setDraft] = useState(initial)

  function formFieldEditor(
    field: EventFormFieldDraft,
    update: (field: EventFormFieldDraft) => void
  ) {
    return (
      <div className="space-y-4">
        <AdminField label={t("fieldKey")} tooltip={t("fieldKeyTip")}>
          <AdminInput
            dir="ltr"
            value={field.key}
            onChange={(event) => update({ ...field, key: event.target.value })}
          />
        </AdminField>
        <AdminField label={t("fieldType")}>
          <AdminSelect
            value={field.type}
            onChange={(event) =>
              update({
                ...field,
                type: event.target.value as EventFormFieldDraft["type"],
              })
            }
          >
            {FORM_FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`fieldTypeOption.${type}`)}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <LocalizedField
          label={t("fieldLabel")}
          value={field.label}
          onChange={(label) => update({ ...field, label })}
        />
        <LocalizedField
          label={t("fieldPlaceholder")}
          value={field.placeholder}
          onChange={(placeholder) => update({ ...field, placeholder })}
        />
        {field.type === "number" && (
          <div className="grid grid-cols-2 gap-4">
            <AdminField label={t("fieldMin")}>
              <AdminInput
                type="number"
                dir="ltr"
                value={field.minValue ?? ""}
                onChange={(event) =>
                  update({
                    ...field,
                    minValue:
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                  })
                }
              />
            </AdminField>
            <AdminField label={t("fieldMax")}>
              <AdminInput
                type="number"
                dir="ltr"
                value={field.maxValue ?? ""}
                onChange={(event) =>
                  update({
                    ...field,
                    maxValue:
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                  })
                }
              />
            </AdminField>
          </div>
        )}
        {field.type === "select" && (
          <div>
            <h4 className="mb-2 text-sm font-medium">{t("fieldOptions")}</h4>
            <RowTable
              items={field.options}
              onChange={(options) => update({ ...field, options })}
              createItem={() => ({ value: "", label: emptyLocalized() })}
              addLabel={t("addOption")}
              columns={[
                {
                  header: t("optionValue"),
                  cell: (option) => option.value || "—",
                },
              ]}
              editTitle={(option) => option.value || t("optionValue")}
              renderRow={(option, index, updateOption) => (
                <div className="space-y-4">
                  <AdminField label={t("optionValue")}>
                    <AdminInput
                      dir="ltr"
                      value={option.value}
                      onChange={(event) =>
                        updateOption({ ...option, value: event.target.value })
                      }
                    />
                  </AdminField>
                  <LocalizedField
                    label={t("optionLabel")}
                    value={option.label}
                    onChange={(label) => updateOption({ ...option, label })}
                  />
                </div>
              )}
            />
          </div>
        )}
        <AdminFlag
          label={t("fieldRequired")}
          checked={field.isRequired}
          onCheckedChange={(isRequired) => update({ ...field, isRequired })}
        />
        <AdminFlag
          label={common("visible")}
          checked={field.isVisible}
          onCheckedChange={(isVisible) => update({ ...field, isVisible })}
        />
      </div>
    )
  }

  function eventTypeEditor(
    type: EventTypeDraft,
    update: (type: EventTypeDraft) => void
  ) {
    const setContent = (patch: Partial<EventTypeDraft["content"]>) =>
      update({ ...type, content: { ...type.content, ...patch } })

    return (
      <div className="space-y-4">
        <AdminField label={t("typeSlug")} tooltip={t("typeSlugTip")}>
          <AdminInput
            dir="ltr"
            value={type.slug}
            onChange={(event) => update({ ...type, slug: event.target.value })}
          />
        </AdminField>
        <LocalizedField
          label={t("typeName")}
          value={type.name}
          onChange={(name) => update({ ...type, name })}
        />
        <AdminFlag
          label={common("visible")}
          checked={type.isVisible}
          onCheckedChange={(isVisible) => update({ ...type, isVisible })}
        />

        <AdminCard title={t("packageDetails")}>
          <LocalizedField
            label={t("heroTitle")}
            value={type.content.heroTitle}
            onChange={(heroTitle) => setContent({ heroTitle })}
          />
          <LocalizedField
            label={t("heroDescription")}
            multiline
            value={type.content.heroDescription}
            onChange={(heroDescription) => setContent({ heroDescription })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField
              label={t("packageAmount")}
              value={type.content.packageAmount}
              onChange={(packageAmount) => setContent({ packageAmount })}
            />
            <MoneyField
              label={t("packageChildrenCount")}
              value={type.content.packageChildrenCount}
              onChange={(packageChildrenCount) =>
                setContent({ packageChildrenCount })
              }
            />
            <MoneyField
              label={t("extraChildAmount")}
              value={type.content.extraChildAmount}
              onChange={(extraChildAmount) => setContent({ extraChildAmount })}
            />
            <MoneyField
              label={t("depositAmount")}
              value={type.content.depositAmount}
              onChange={(depositAmount) => setContent({ depositAmount })}
            />
          </div>
          <LocalizedField
            label={t("formIntro")}
            multiline
            value={type.content.formIntro}
            onChange={(formIntro) => setContent({ formIntro })}
          />
          <LocalizedField
            label={t("formTerms")}
            multiline
            value={type.content.formTerms}
            onChange={(formTerms) => setContent({ formTerms })}
          />
          <AdminFlag
            label={t("requiresSignature")}
            description={t("requiresSignatureTip")}
            checked={type.content.requiresSignature}
            onCheckedChange={(requiresSignature) =>
              setContent({ requiresSignature })
            }
          />
        </AdminCard>

        <AdminCard title={t("steps")}>
          <RowTable
            items={type.steps}
            onChange={(steps) => update({ ...type, steps })}
            createItem={() => ({
              title: emptyLocalized(),
              description: emptyLocalized(),
            })}
            addLabel={t("addStep")}
            columns={[
              { header: t("stepTitle"), cell: (item) => item.title.he || "—" },
            ]}
            editTitle={(item) => item.title.he || t("stepTitle")}
            renderRow={(step, index, updateStep) => (
              <div className="space-y-4">
                <LocalizedField
                  label={t("stepTitle")}
                  value={step.title}
                  onChange={(title) => updateStep({ ...step, title })}
                />
                <LocalizedField
                  label={t("stepDescription")}
                  multiline
                  value={step.description}
                  onChange={(description) =>
                    updateStep({ ...step, description })
                  }
                />
              </div>
            )}
          />
        </AdminCard>

        <AdminCard title={t("packageLines")}>
          <RowTable
            items={type.packageLines}
            onChange={(packageLines) => update({ ...type, packageLines })}
            createItem={() => ({ label: emptyLocalized() })}
            addLabel={t("addPackageLine")}
            columns={[
              { header: t("lineLabel"), cell: (item) => item.label.he || "—" },
            ]}
            editTitle={() => t("lineLabel")}
            renderRow={(line, index, updateLine) => (
              <LocalizedField
                label={t("lineLabel")}
                value={line.label}
                onChange={(label) => updateLine({ ...line, label })}
              />
            )}
          />
        </AdminCard>

        <AdminCard title={t("upgrades")}>
          <RowTable
            items={type.upgrades}
            onChange={(upgrades) => update({ ...type, upgrades })}
            createItem={() => ({ label: emptyLocalized(), amount: null })}
            addLabel={t("addUpgrade")}
            columns={[
              {
                header: t("upgradeLabel"),
                cell: (item) => item.label.he || "—",
              },
            ]}
            editTitle={() => t("upgradeLabel")}
            renderRow={(upgrade, index, updateUpgrade) => (
              <div className="space-y-4">
                <LocalizedField
                  label={t("upgradeLabel")}
                  value={upgrade.label}
                  onChange={(label) => updateUpgrade({ ...upgrade, label })}
                />
                <MoneyField
                  label={t("upgradeAmount")}
                  value={upgrade.amount}
                  onChange={(amount) => updateUpgrade({ ...upgrade, amount })}
                />
              </div>
            )}
          />
        </AdminCard>

        <AdminCard title={t("formFields")} description={t("formFieldsTip")}>
          <RowTable
            items={type.formFields}
            onChange={(formFields) => update({ ...type, formFields })}
            createItem={(): EventFormFieldDraft => ({
              key: "",
              label: emptyLocalized(),
              placeholder: emptyLocalized(),
              type: "text",
              options: [],
              minValue: null,
              maxValue: null,
              isRequired: false,
              isVisible: true,
            })}
            addLabel={t("addField")}
            columns={[
              {
                header: t("fieldKey"),
                cell: (item) => item.key || "—",
                className: "font-mono text-xs",
              },
              {
                header: t("fieldType"),
                cell: (item) => item.type,
                className: "w-24",
              },
            ]}
            editTitle={(item) => item.key || t("fieldKey")}
            renderRow={(field, index, updateField) =>
              formFieldEditor(field, updateField)
            }
          />
        </AdminCard>
      </div>
    )
  }

  return (
    <SectionForm
      slug={slug}
      title={t("title")}
      description={t("description")}
      draft={draft}
      onSave={(value) => saveEvents(value)}
    >
      <AdminCard title={t("eventTypes")}>
        <RowTable
          items={draft.eventTypes}
          onChange={(eventTypes) =>
            setDraft((prev) => ({ ...prev, eventTypes }))
          }
          createItem={() => ({
            slug: "",
            name: emptyLocalized(),
            isVisible: true,
            content: {
              heroTitle: emptyLocalized(),
              heroDescription: emptyLocalized(),
              packageAmount: null,
              packageChildrenCount: null,
              extraChildAmount: null,
              depositAmount: null,
              formIntro: emptyLocalized(),
              formTerms: emptyLocalized(),
              requiresSignature: false,
            },
            steps: [],
            packageLines: [],
            upgrades: [],
            formFields: [],
          })}
          addLabel={t("addEventType")}
          columns={[
            { header: t("typeName"), cell: (item) => item.name.he || "—" },
            {
              header: t("typeSlug"),
              cell: (item) => item.slug || "—",
              className: "font-mono text-xs",
            },
          ]}
          editTitle={(item) => item.name.he || t("addEventType")}
          renderRow={(type, index, update) => eventTypeEditor(type, update)}
        />
      </AdminCard>
    </SectionForm>
  )
}
