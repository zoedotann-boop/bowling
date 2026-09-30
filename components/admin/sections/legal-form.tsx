"use client"

import { ExternalLink } from "lucide-react"
import { useTranslations } from "next-intl"

import { AdminCard } from "@/components/admin/admin-ui"
import { LocalizedField } from "@/components/admin/localized-field"
import { SectionForm, useSectionDraft } from "@/components/admin/section-form"
import { Button } from "@/components/ui/button"
import { saveLegal } from "@/lib/actions/admin/legal"
import type { LegalDraft } from "@/lib/actions/admin/schemas"
import { LEGAL_PAGE_KINDS } from "@/lib/legal"

export function LegalForm({
  slug,
  initial,
}: {
  slug: string
  initial: LegalDraft
}) {
  const t = useTranslations("admin.legal")
  const [draft, setDraft] = useSectionDraft(initial)

  return (
    <SectionForm
      slug={slug}
      title={t("title")}
      description={t("description")}
      draft={draft}
      onSave={(value) => saveLegal(value)}
    >
      {LEGAL_PAGE_KINDS.map((kind) => (
        <AdminCard
          key={kind}
          title={t(kind)}
          description={t("defaultHint")}
          actions={
            <Button
              variant="outline"
              size="sm"
              render={
                <a
                  href={`/${slug}/${kind}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink />
                  {t("viewPage")}
                </a>
              }
            />
          }
        >
          <LocalizedField
            label={t("body")}
            tooltip={t("bodyTip")}
            multiline
            rows={18}
            value={draft[kind]}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, [kind]: value }))
            }
          />
        </AdminCard>
      ))}
    </SectionForm>
  )
}
