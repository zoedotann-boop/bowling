import { GeneralForm } from "@/components/admin/sections/general-form"
import { requireLocationAccess } from "@/lib/admin/access"
import { toHoursDraft, toLocalized } from "@/lib/admin/drafts"
import type { GeneralDraft } from "@/lib/actions/admin/schemas"
import { getGeneralEditor } from "@/lib/db/queries/admin"

export default async function GeneralPage({
  params,
}: {
  params: Promise<{ location: string }>
}) {
  const { location: slug } = await params
  const { location: loc } = await requireLocationAccess(slug, "settings")
  const data = await getGeneralEditor(loc.id)

  const draft: GeneralDraft = {
    slug,
    name: toLocalized(data?.name),
    addressLine1: toLocalized(data?.addressLine1),
    addressLine2: toLocalized(data?.addressLine2),
    addressFull: toLocalized(data?.addressFull),
    laneDesc: toLocalized(data?.laneDesc),
    phone: data?.phone ?? "",
    whatsapp: data?.whatsapp ?? "",
    email: data?.email ?? "",
    wazeUrl: data?.wazeUrl ?? "",
    logoUrl: data?.logoUrl ?? "",
    lanes: data?.lanes ?? 0,
    hasGymboree: data?.hasGymboree ?? false,
    hasNotice: data?.hasNotice ?? false,
    noticeTitle: toLocalized(data?.noticeTitle),
    noticeBody: toLocalized(data?.noticeBody),
    hours: toHoursDraft(data?.hours),
    seoTitle: toLocalized(data?.seoTitle),
    seoDescription: toLocalized(data?.seoDescription),
    contactTitle: toLocalized(data?.site?.contactTitle),
    contactIntro: toLocalized(data?.site?.contactIntro),
    footerNote: toLocalized(data?.site?.footerNote),
  }

  return <GeneralForm slug={slug} initial={draft} />
}
