import { LegalForm } from "@/components/admin/sections/legal-form"
import { requireLocationAccess } from "@/lib/admin/access"
import type { LegalDraft } from "@/lib/actions/admin/schemas"
import { getLegalEditor } from "@/lib/db/queries/admin"
import { type LegalPageKind, withDefaults } from "@/lib/legal"
import { legalDefaults } from "@/lib/legal-defaults"

export default async function LegalPage({
  params,
}: {
  params: Promise<{ location: string }>
}) {
  const { location: slug } = await params
  const { location: loc } = await requireLocationAccess(slug, "settings")
  const rows = await getLegalEditor(loc.id)

  const bodyOf = (kind: LegalPageKind) =>
    withDefaults(
      rows.find((row) => row.kind === kind)?.body,
      legalDefaults(kind)
    )

  const draft: LegalDraft = {
    slug,
    terms: bodyOf("terms"),
    accessibility: bodyOf("accessibility"),
  }

  return <LegalForm slug={slug} initial={draft} />
}
