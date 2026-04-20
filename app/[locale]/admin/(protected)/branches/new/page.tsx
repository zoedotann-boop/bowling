import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"
import { BranchForm } from "@/components/admin/branch-form"

export const metadata: Metadata = {
  title: "Admin · New branch",
  robots: { index: false, follow: false },
}

export default async function NewBranchPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Admin.branches.form" })
  const tl = await getTranslations({
    locale,
    namespace: "Admin.branches.list",
  })

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/admin/branches"
          className="text-xs text-ink-muted hover:text-ink"
        >
          ← {tl("title")}
        </Link>
        <h1 className="text-2xl font-semibold text-ink">{t("newTitle")}</h1>
      </header>
      <BranchForm mode="create" />
    </div>
  )
}
