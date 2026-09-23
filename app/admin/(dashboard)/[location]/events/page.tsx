import { EventsForm } from "@/components/admin/sections/events-form"
import { requireLocationAccess } from "@/lib/admin/access"
import { toLocalized } from "@/lib/admin/drafts"
import type { EventsDraft } from "@/lib/actions/admin/schemas"
import { getEventsEditor } from "@/lib/db/queries/admin"

export default async function EventsPage({
  params,
}: {
  params: Promise<{ location: string }>
}) {
  const { location: slug } = await params
  const { location: loc } = await requireLocationAccess(slug, "content")
  const data = await getEventsEditor(loc.id)

  const draft: EventsDraft = {
    slug,
    eventTypes: (data?.eventTypes ?? []).map((type) => ({
      id: type.id,
      slug: type.slug,
      name: toLocalized(type.name),
      isVisible: type.isVisible,
      content: {
        heroTitle: toLocalized(type.content?.heroTitle),
        heroDescription: toLocalized(type.content?.heroDescription),
        packageAmount: type.content?.packageAmount ?? null,
        packageChildrenCount: type.content?.packageChildrenCount ?? null,
        extraChildAmount: type.content?.extraChildAmount ?? null,
        depositAmount: type.content?.depositAmount ?? null,
        formIntro: toLocalized(type.content?.formIntro),
        formTerms: toLocalized(type.content?.formTerms),
        requiresSignature: type.content?.requiresSignature ?? false,
      },
      steps: type.steps.map((step) => ({
        id: step.id,
        title: toLocalized(step.title),
        description: toLocalized(step.description),
      })),
      packageLines: type.packageLines.map((line) => ({
        id: line.id,
        label: toLocalized(line.label),
      })),
      upgrades: type.upgrades.map((upgrade) => ({
        id: upgrade.id,
        label: toLocalized(upgrade.label),
        amount: upgrade.amount,
      })),
      formFields: type.formFields.map((field) => ({
        id: field.id,
        key: field.key,
        label: toLocalized(field.label),
        placeholder: toLocalized(field.placeholder),
        type: field.type,
        options: (field.options ?? []).map((option) => ({
          value: option.value,
          label: toLocalized(option.label),
        })),
        minValue: field.minValue,
        maxValue: field.maxValue,
        isRequired: field.isRequired,
        isVisible: field.isVisible,
      })),
    })),
  }

  return <EventsForm slug={slug} initial={draft} />
}
