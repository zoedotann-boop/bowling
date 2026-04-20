import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { BranchForm } from "@/components/admin/branch-form"
import { PageHeader } from "@/components/admin/page-header"

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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("newTitle")} />
      <BranchForm mode="create" />
    </div>
  )
}
