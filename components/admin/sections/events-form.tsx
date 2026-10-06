"use client"

import { ExternalLink, FileSignature } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { AdminTabs } from "@/components/admin/admin-tabs"
import {
  AdminBadge,
  AdminField,
  AdminFlag,
  AdminInput,
  AdminSelect,
  AdminSubsection,
} from "@/components/admin/admin-ui"
import { CollectionEditor } from "@/components/admin/collection-editor"
import { ImageField } from "@/components/admin/image-field"
import { LocalizedField } from "@/components/admin/localized-field"
import { RowTable } from "@/components/admin/row-table"
import { SectionForm, useSectionDraft } from "@/components/admin/section-form"
import { WaiverLink } from "@/components/admin/waiver-link"
import { Button } from "@/components/ui/button"
import { saveEvents } from "@/lib/actions/admin/events"
import type {
  EventFormFieldDraft,
  EventPriceOptionDraft,
  EventsDraft,
  EventTypeDraft,
} from "@/lib/actions/admin/schemas"
import { parseWholeNumber } from "@/lib/admin/drafts"
import { nextFreeSlug, toSlug } from "@/lib/admin/slug"
import type { Localized } from "@/lib/db/schema/_shared"
import {
  PRICE_SUMMARY_MODES,
  summaryRowsFromPrices,
  type PriceSummaryMode,
} from "@/lib/events/details"
import { FORM_FIELD_TYPES, isCoreField, newFieldKey } from "@/lib/events/fields"
import { usesContactForm, waiverPath } from "@/lib/events/slugs"
import { emptyLocalized, formatPrice } from "@/lib/localized"
import type { Locale } from "@/lib/locales"

const EDITABLE_FIELD_TYPES = FORM_FIELD_TYPES.filter((type) => type !== "time")
const isFixedField = (field: EventFormFieldDraft) => field.type === "time"

const NO_PLACEHOLDER: EventFormFieldDraft["type"][] = ["checkbox", "date"]

function newEventType(slug: string): EventTypeDraft {
  return {
    slug,
    name: emptyLocalized(),
    isVisible: true,
    content: {
      heroTitle: emptyLocalized(),
      heroDescription: emptyLocalized(),
      heroImageUrl: "",
      badges: [],
      depositAmount: null,
      scheduleTitle: emptyLocalized(),
      priceNote: emptyLocalized(),
      priceOptions: [],
      priceSummaryMode: "auto",
      priceSummaryRows: [],
      allowedItems: [],
      forbiddenItems: [],
      rulesNote: emptyLocalized(),
      policyItems: [],
      policyNote: emptyLocalized(),
      formIntro: emptyLocalized(),
      formTerms: emptyLocalized(),
      formFootnote: emptyLocalized(),
      upgradesTitle: emptyLocalized(),
      upgradesNote: emptyLocalized(),
      requiresSignature: false,
    },
    steps: [],
    packageLines: [],
    upgrades: [],
    formFields: [],
  }
}

type WaiverStatus = "ready" | "unsaved" | "hidden" | "noFields"

function waiverStatus(type: EventTypeDraft): WaiverStatus | null {
  if (usesContactForm(type.slug)) return null
  if (!type.id) return "unsaved"
  if (!type.isVisible) return "hidden"
  if (!type.formFields.length) return "noFields"
  return "ready"
}

function newPriceOption(): EventPriceOptionDraft {
  return {
    label: emptyLocalized(),
    days: emptyLocalized(),
    badge: emptyLocalized(),
    amount: null,
    childrenCount: null,
    extraChildAmount: null,
  }
}

function newFormField(): EventFormFieldDraft {
  return {
    key: newFieldKey(),
    label: emptyLocalized(),
    placeholder: emptyLocalized(),
    type: "text",
    options: [],
    minValue: null,
    maxValue: null,
    isRequired: false,
    isVisible: true,
  }
}

function NumberField({
  label,
  tooltip,
  value,
  onChange,
  min = 0,
}: {
  label: string
  tooltip?: string
  value: number | null
  onChange: (value: number | null) => void
  min?: number
}) {
  return (
    <AdminField label={label} tooltip={tooltip}>
      <AdminInput
        type="number"
        min={min}
        dir="ltr"
        value={value ?? ""}
        onChange={(event) => onChange(parseWholeNumber(event.target.value))}
      />
    </AdminField>
  )
}

function TextListField({
  title,
  addLabel,
  itemLabel,
  itemTooltip,
  items,
  onChange,
}: {
  title?: string
  addLabel: string
  itemLabel: string
  itemTooltip: string
  items: Localized[]
  onChange: (items: Localized[]) => void
}) {
  return (
    <div>
      {title && <h4 className="mb-2 text-sm font-medium">{title}</h4>}
      <RowTable
        items={items}
        onChange={onChange}
        createItem={emptyLocalized}
        addLabel={addLabel}
        columns={[{ header: itemLabel, cell: (item) => item.he || "—" }]}
        renderRow={(item, update) => (
          <LocalizedField
            label={itemLabel}
            tooltip={itemTooltip}
            value={item}
            onChange={update}
          />
        )}
      />
    </div>
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
  const [draft, setDraft] = useSectionDraft(initial)
  const [tab, setTab] = useState("page")

  const slugs = draft.eventTypes.map((type) => type.slug)

  return (
    <SectionForm
      slug={slug}
      title={t("title")}
      description={t("description")}
      draft={draft}
      onSave={(value) => saveEvents(value)}
    >
      <CollectionEditor
        items={draft.eventTypes}
        onChange={(eventTypes) => setDraft((prev) => ({ ...prev, eventTypes }))}
        createItem={() => newEventType(nextFreeSlug("event", slugs))}
        addLabel={t("addEventType")}
        emptyLabel={t("empty")}
        removeLabel={t("removeEventType")}
        removeMessage={t("removeEventTypeMessage")}
        itemLabel={(type) => type.name.he}
        isHidden={(type) => !type.isVisible}
        detailActions={(type) =>
          type.id && (
            <>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <a
                    href={`/${slug}/events/${type.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                    {t("viewPage")}
                  </a>
                }
              />
              {waiverStatus(type) === "ready" && (
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={
                    <a
                      href={waiverPath(slug, type.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileSignature />
                      {t("waiverOpen")}
                    </a>
                  }
                />
              )}
            </>
          )
        }
        renderDetail={(type, update) => (
          <EventTypeEditor
            type={type}
            update={update}
            siteSlug={slug}
            tab={tab}
            onTabChange={setTab}
          />
        )}
      />
    </SectionForm>
  )
}

function EventTypeEditor({
  type,
  update,
  siteSlug,
  tab,
  onTabChange,
}: {
  type: EventTypeDraft
  update: (type: EventTypeDraft) => void
  siteSlug: string
  tab: string
  onTabChange: (tab: string) => void
}) {
  const t = useTranslations("admin.events")
  const common = useTranslations("admin.common")
  const locale = useLocale() as Locale

  const setContent = (patch: Partial<EventTypeDraft["content"]>) =>
    update({ ...type, content: { ...type.content, ...patch } })

  const setSummaryMode = (priceSummaryMode: PriceSummaryMode) =>
    setContent({
      priceSummaryMode,
      priceSummaryRows:
        priceSummaryMode === "manual" && !type.content.priceSummaryRows.length
          ? summaryRowsFromPrices(type.content.priceOptions)
          : type.content.priceSummaryRows,
    })

  const pageTab = (
    <>
      <AdminSubsection title={t("basics")}>
        <LocalizedField
          label={t("typeName")}
          tooltip={t("typeNameTip")}
          value={type.name}
          onChange={(name) => update({ ...type, name })}
        />
        {!type.id && (
          <AdminField label={t("pageAddress")} tooltip={t("pageAddressTip")}>
            <div
              dir="ltr"
              className="flex items-center gap-1 text-sm text-muted-foreground"
            >
              <span className="shrink-0">/{siteSlug}/events/</span>
              <AdminInput
                value={type.slug}
                onChange={(event) =>
                  update({ ...type, slug: toSlug(event.target.value) })
                }
              />
            </div>
          </AdminField>
        )}
        <AdminFlag
          label={common("visible")}
          description={common("visibleTip")}
          checked={type.isVisible}
          onCheckedChange={(isVisible) => update({ ...type, isVisible })}
        />
      </AdminSubsection>

      <AdminSubsection title={t("pageTop")}>
        <LocalizedField
          label={t("heroTitle")}
          tooltip={t("heroTitleTip")}
          value={type.content.heroTitle}
          onChange={(heroTitle) => setContent({ heroTitle })}
        />
        <LocalizedField
          label={t("heroDescription")}
          tooltip={t("heroDescriptionTip")}
          multiline
          value={type.content.heroDescription}
          onChange={(heroDescription) => setContent({ heroDescription })}
        />
        <ImageField
          label={t("heroImage")}
          tooltip={t("heroImageTip")}
          value={type.content.heroImageUrl}
          onChange={(heroImageUrl) => setContent({ heroImageUrl })}
        />
      </AdminSubsection>

      <AdminSubsection title={t("badges")} description={t("badgesTip")}>
        <TextListField
          addLabel={t("addBadge")}
          itemLabel={t("badgeText")}
          itemTooltip={t("badgeTextTip")}
          items={type.content.badges}
          onChange={(badges) => setContent({ badges })}
        />
      </AdminSubsection>

      <AdminSubsection title={t("steps")} description={t("stepsTip")}>
        <LocalizedField
          label={t("scheduleTitle")}
          tooltip={t("scheduleTitleTip")}
          value={type.content.scheduleTitle}
          onChange={(scheduleTitle) => setContent({ scheduleTitle })}
        />
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
          renderRow={(step, updateStep) => (
            <>
              <LocalizedField
                label={t("stepTitle")}
                tooltip={t("stepTitleTip")}
                value={step.title}
                onChange={(title) => updateStep({ ...step, title })}
              />
              <LocalizedField
                label={t("stepDescription")}
                tooltip={t("stepDescriptionTip")}
                multiline
                value={step.description}
                onChange={(description) => updateStep({ ...step, description })}
              />
            </>
          )}
        />
      </AdminSubsection>
    </>
  )

  const packageTab = (
    <>
      <AdminSubsection title={t("price")} description={t("priceHint")}>
        <LocalizedField
          label={t("priceNote")}
          tooltip={t("priceNoteTip")}
          multiline
          value={type.content.priceNote}
          onChange={(priceNote) => setContent({ priceNote })}
        />
        <RowTable
          items={type.content.priceOptions}
          onChange={(priceOptions) => setContent({ priceOptions })}
          createItem={newPriceOption}
          addLabel={t("addPriceOption")}
          columns={[
            {
              header: t("priceOptionLabel"),
              cell: (item) => item.label.he || "—",
            },
            {
              header: t("priceOptionAmount"),
              cell: (item) =>
                item.amount === null ? "—" : formatPrice(item.amount, locale),
              className: "w-24",
            },
          ]}
          renderRow={(option, updateOption) => (
            <PriceOptionEditor option={option} update={updateOption} />
          )}
        />
        <NumberField
          label={t("depositAmount")}
          tooltip={t("depositAmountTip")}
          value={type.content.depositAmount}
          onChange={(depositAmount) => setContent({ depositAmount })}
        />
      </AdminSubsection>

      {!usesContactForm(type.slug) && (
        <AdminSubsection
          title={t("priceSummary")}
          description={t("priceSummaryTip")}
        >
          <AdminField
            label={t("priceSummaryMode")}
            tooltip={t("priceSummaryModeTip")}
          >
            <AdminSelect
              value={type.content.priceSummaryMode}
              onChange={(event) =>
                setSummaryMode(event.target.value as PriceSummaryMode)
              }
            >
              {PRICE_SUMMARY_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {t(`priceSummaryModeOption.${mode}`)}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          {type.content.priceSummaryMode === "auto" && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              {t("priceSummaryAutoHint")}
            </p>
          )}
          {type.content.priceSummaryMode === "manual" && (
            <RowTable
              items={type.content.priceSummaryRows}
              onChange={(priceSummaryRows) => setContent({ priceSummaryRows })}
              createItem={() => ({
                label: emptyLocalized(),
                value: emptyLocalized(),
              })}
              addLabel={t("addSummaryRow")}
              columns={[
                {
                  header: t("summaryRowLabel"),
                  cell: (item) => item.label.he || "—",
                },
                {
                  header: t("summaryRowValue"),
                  cell: (item) => item.value.he || "—",
                  className: "w-24",
                },
              ]}
              renderRow={(row, updateRow) => (
                <div className="grid gap-4 sm:grid-cols-2">
                  <LocalizedField
                    label={t("summaryRowLabel")}
                    tooltip={t("summaryRowLabelTip")}
                    value={row.label}
                    onChange={(label) => updateRow({ ...row, label })}
                  />
                  <LocalizedField
                    label={t("summaryRowValue")}
                    tooltip={t("summaryRowValueTip")}
                    value={row.value}
                    onChange={(value) => updateRow({ ...row, value })}
                  />
                </div>
              )}
            />
          )}
        </AdminSubsection>
      )}

      <AdminSubsection
        title={t("packageLines")}
        description={t("packageLinesTip")}
      >
        <RowTable
          items={type.packageLines}
          onChange={(packageLines) => update({ ...type, packageLines })}
          createItem={() => ({ label: emptyLocalized() })}
          addLabel={t("addPackageLine")}
          columns={[
            { header: t("lineLabel"), cell: (item) => item.label.he || "—" },
          ]}
          renderRow={(line, updateLine) => (
            <LocalizedField
              label={t("lineLabel")}
              tooltip={t("lineLabelTip")}
              value={line.label}
              onChange={(label) => updateLine({ ...line, label })}
            />
          )}
        />
      </AdminSubsection>
    </>
  )

  const upgradesTab = (
    <>
      <AdminSubsection title={t("upgrades")} description={t("upgradesTip")}>
        <RowTable
          items={type.upgrades}
          onChange={(upgrades) => update({ ...type, upgrades })}
          createItem={() => ({ label: emptyLocalized(), amount: null })}
          addLabel={t("addUpgrade")}
          columns={[
            { header: t("upgradeLabel"), cell: (item) => item.label.he || "—" },
            {
              header: t("upgradeAmount"),
              cell: (item) =>
                item.amount === null ? "—" : formatPrice(item.amount, locale),
              className: "w-24",
            },
          ]}
          renderRow={(upgrade, updateUpgrade) => (
            <>
              <LocalizedField
                label={t("upgradeLabel")}
                tooltip={t("upgradeLabelTip")}
                value={upgrade.label}
                onChange={(label) => updateUpgrade({ ...upgrade, label })}
              />
              <NumberField
                label={t("upgradeAmount")}
                tooltip={t("upgradeAmountTip")}
                value={upgrade.amount}
                onChange={(amount) => updateUpgrade({ ...upgrade, amount })}
              />
            </>
          )}
        />
      </AdminSubsection>

      {!usesContactForm(type.slug) && (
        <AdminSubsection
          title={t("upgradesBox")}
          description={t("upgradesBoxTip")}
        >
          <LocalizedField
            label={t("upgradesTitle")}
            tooltip={t("upgradesTitleTip")}
            value={type.content.upgradesTitle}
            onChange={(upgradesTitle) => setContent({ upgradesTitle })}
          />
          <LocalizedField
            label={t("upgradesNote")}
            tooltip={t("upgradesNoteTip")}
            multiline
            value={type.content.upgradesNote}
            onChange={(upgradesNote) => setContent({ upgradesNote })}
          />
        </AdminSubsection>
      )}
    </>
  )

  const rulesTab = (
    <>
      <AdminSubsection title={t("rules")} description={t("rulesTip")}>
        <div className="grid gap-4 xl:grid-cols-2">
          <TextListField
            title={t("allowedItems")}
            addLabel={t("addAllowedItem")}
            itemLabel={t("ruleText")}
            itemTooltip={t("ruleTextTip")}
            items={type.content.allowedItems}
            onChange={(allowedItems) => setContent({ allowedItems })}
          />
          <TextListField
            title={t("forbiddenItems")}
            addLabel={t("addForbiddenItem")}
            itemLabel={t("ruleText")}
            itemTooltip={t("ruleTextTip")}
            items={type.content.forbiddenItems}
            onChange={(forbiddenItems) => setContent({ forbiddenItems })}
          />
        </div>
        <LocalizedField
          label={t("rulesNote")}
          tooltip={t("rulesNoteTip")}
          multiline
          value={type.content.rulesNote}
          onChange={(rulesNote) => setContent({ rulesNote })}
        />
      </AdminSubsection>

      <AdminSubsection title={t("policy")} description={t("policyTip")}>
        <RowTable
          items={type.content.policyItems}
          onChange={(policyItems) => setContent({ policyItems })}
          createItem={() => ({
            title: emptyLocalized(),
            description: emptyLocalized(),
          })}
          addLabel={t("addPolicyItem")}
          columns={[
            {
              header: t("policyItemTitle"),
              cell: (item) => item.title.he || "—",
            },
          ]}
          renderRow={(item, updateItem) => (
            <>
              <LocalizedField
                label={t("policyItemTitle")}
                tooltip={t("policyItemTitleTip")}
                value={item.title}
                onChange={(title) => updateItem({ ...item, title })}
              />
              <LocalizedField
                label={t("policyItemDescription")}
                tooltip={t("policyItemDescriptionTip")}
                multiline
                value={item.description}
                onChange={(description) => updateItem({ ...item, description })}
              />
            </>
          )}
        />
        <LocalizedField
          label={t("policyNote")}
          tooltip={t("policyNoteTip")}
          multiline
          value={type.content.policyNote}
          onChange={(policyNote) => setContent({ policyNote })}
        />
      </AdminSubsection>
    </>
  )

  const waiver = waiverStatus(type)

  const formTab = usesContactForm(type.slug) ? (
    <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
      {t("contactFormTip")}
    </p>
  ) : (
    <>
      <AdminSubsection title={t("waiverLink")} description={t("waiverLinkTip")}>
        {waiver === "ready" ? (
          <WaiverLink path={waiverPath(siteSlug, type.slug)} />
        ) : (
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {t(`waiverUnavailable.${waiver}`)}
          </p>
        )}
      </AdminSubsection>

      <AdminSubsection title={t("formFields")} description={t("formFieldsTip")}>
        <RowTable
          items={type.formFields}
          onChange={(formFields) => update({ ...type, formFields })}
          createItem={newFormField}
          canRemove={(field) => !isCoreField(field.key) && !isFixedField(field)}
          canEdit={(field) => !isFixedField(field)}
          addLabel={t("addField")}
          columns={[
            {
              header: t("fieldLabel"),
              cell: (field) => (
                <>
                  {field.label.he || "—"}
                  {field.isRequired && (
                    <span className="text-destructive" aria-hidden>
                      {" *"}
                    </span>
                  )}
                  {!field.isVisible && (
                    <AdminBadge>{common("hidden")}</AdminBadge>
                  )}
                </>
              ),
            },
            {
              header: t("fieldType"),
              cell: (field) => t(`fieldTypeOption.${field.type}`),
              className: "w-28",
            },
          ]}
          renderRow={(field, updateField) => (
            <FormFieldEditor field={field} update={updateField} />
          )}
        />
      </AdminSubsection>

      <AdminSubsection
        title={t("bookingForm")}
        description={t("bookingFormTip")}
      >
        <LocalizedField
          label={t("formIntro")}
          tooltip={t("formIntroTip")}
          multiline
          value={type.content.formIntro}
          onChange={(formIntro) => setContent({ formIntro })}
        />
        <LocalizedField
          label={t("formTerms")}
          tooltip={t("formTermsTip")}
          multiline
          value={type.content.formTerms}
          onChange={(formTerms) => setContent({ formTerms })}
        />
        <LocalizedField
          label={t("formFootnote")}
          tooltip={t("formFootnoteTip")}
          multiline
          value={type.content.formFootnote}
          onChange={(formFootnote) => setContent({ formFootnote })}
        />
        <AdminFlag
          label={t("requiresSignature")}
          description={t("requiresSignatureTip")}
          checked={type.content.requiresSignature}
          onCheckedChange={(requiresSignature) =>
            setContent({ requiresSignature })
          }
        />
      </AdminSubsection>
    </>
  )

  return (
    <AdminTabs
      value={tab}
      onValueChange={onTabChange}
      tabs={[
        { value: "page", label: t("tabPage"), content: pageTab },
        { value: "package", label: t("tabPackage"), content: packageTab },
        { value: "upgrades", label: t("tabUpgrades"), content: upgradesTab },
        { value: "rules", label: t("tabRules"), content: rulesTab },
        { value: "form", label: t("tabForm"), content: formTab },
      ]}
    />
  )
}

function PriceOptionEditor({
  option,
  update,
}: {
  option: EventPriceOptionDraft
  update: (option: EventPriceOptionDraft) => void
}) {
  const t = useTranslations("admin.events")

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <LocalizedField
          label={t("priceOptionLabel")}
          tooltip={t("priceOptionLabelTip")}
          value={option.label}
          onChange={(label) => update({ ...option, label })}
        />
        <LocalizedField
          label={t("priceOptionDays")}
          tooltip={t("priceOptionDaysTip")}
          value={option.days}
          onChange={(days) => update({ ...option, days })}
        />
      </div>
      <LocalizedField
        label={t("priceOptionBadge")}
        tooltip={t("priceOptionBadgeTip")}
        value={option.badge}
        onChange={(badge) => update({ ...option, badge })}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField
          label={t("priceOptionAmount")}
          tooltip={t("priceOptionAmountTip")}
          value={option.amount}
          onChange={(amount) => update({ ...option, amount })}
        />
        <NumberField
          label={t("priceOptionChildren")}
          tooltip={t("priceOptionChildrenTip")}
          value={option.childrenCount}
          onChange={(childrenCount) => update({ ...option, childrenCount })}
        />
        <NumberField
          label={t("priceOptionExtraChild")}
          tooltip={t("priceOptionExtraChildTip")}
          value={option.extraChildAmount}
          onChange={(extraChildAmount) =>
            update({ ...option, extraChildAmount })
          }
        />
      </div>
    </>
  )
}

function FormFieldEditor({
  field,
  update,
}: {
  field: EventFormFieldDraft
  update: (field: EventFormFieldDraft) => void
}) {
  const t = useTranslations("admin.events")
  const common = useTranslations("admin.common")

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <LocalizedField
          label={t("fieldLabel")}
          tooltip={t("fieldLabelTip")}
          value={field.label}
          onChange={(label) => update({ ...field, label })}
        />
        <AdminField label={t("fieldType")} tooltip={t("fieldTypeTip")}>
          <AdminSelect
            value={field.type}
            onChange={(event) =>
              update({
                ...field,
                type: event.target.value as EventFormFieldDraft["type"],
              })
            }
          >
            {EDITABLE_FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`fieldTypeOption.${type}`)}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
      </div>
      {!NO_PLACEHOLDER.includes(field.type) && (
        <LocalizedField
          label={t("fieldPlaceholder")}
          tooltip={t("fieldPlaceholderTip")}
          value={field.placeholder}
          onChange={(placeholder) => update({ ...field, placeholder })}
        />
      )}
      {field.type === "number" && (
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label={t("fieldMin")}
            tooltip={t("fieldMinTip")}
            min={undefined}
            value={field.minValue}
            onChange={(minValue) => update({ ...field, minValue })}
          />
          <NumberField
            label={t("fieldMax")}
            tooltip={t("fieldMaxTip")}
            min={undefined}
            value={field.maxValue}
            onChange={(maxValue) => update({ ...field, maxValue })}
          />
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
                header: t("optionLabel"),
                cell: (option) => option.label.he || "—",
              },
            ]}
            renderRow={(option, updateOption) => (
              <LocalizedField
                label={t("optionLabel")}
                tooltip={t("optionLabelTip")}
                value={option.label}
                onChange={(label) =>
                  updateOption({
                    label,
                    value: label.he.trim() || label.en?.trim() || option.value,
                  })
                }
              />
            )}
          />
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <AdminFlag
          label={t("fieldRequired")}
          description={t("fieldRequiredTip")}
          checked={field.isRequired}
          onCheckedChange={(isRequired) => update({ ...field, isRequired })}
        />
        <AdminFlag
          label={common("visible")}
          description={common("visibleTip")}
          checked={field.isVisible}
          onCheckedChange={(isVisible) => update({ ...field, isVisible })}
        />
      </div>
    </>
  )
}
