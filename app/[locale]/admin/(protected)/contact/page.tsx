import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import * as services from "@/lib/services"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/admin/page-header"

export const metadata: Metadata = {
  title: "Admin · Contact",
  robots: { index: false, follow: false },
}

export default async function AdminContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Admin.contact" })
  const { data: branches } = await services.branches.list(locale as Locale)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("indexTitle")} description={t("indexDescription")} />
      {branches.length === 0 ? (
        <Card className="p-10 text-center text-sm text-ink-muted">
          {t("empty")}
        </Card>
      ) : (
        <Card className="divide-y divide-line py-0">
          {branches.map((b) => (
            <Link
              key={b.id}
              href={`/admin/contact/${b.slug}`}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/40"
            >
              <div className="flex flex-col">
                <span className="text-sm text-ink">
                  {b.displayName ?? b.slug}
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  {b.slug}
                </span>
              </div>
              <div className="text-end font-mono text-xs text-ink-muted">
                {b.phone}
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
