import type { Metadata } from "next"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { IconArrowNarrowRight } from "@tabler/icons-react"

import { auth } from "@/lib/auth"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import * as services from "@/lib/services"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Admin.home" })
  const session = await auth.api.getSession({ headers: await headers() })
  const name = session?.user.name ?? session?.user.email ?? ""

  const { data: branches } = await services.branches.list(locale as Locale)
  const publishedCount = branches.filter((b) => b.published).length

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-ink-muted">{t("eyebrow")}</p>
        <h1 className="text-3xl font-semibold text-ink">
          {t("greeting", { name })}
        </h1>
      </header>
      <Link
        href="/admin/branches"
        className="group flex items-center justify-between gap-4 border border-line bg-surface p-5 transition-colors hover:bg-muted/40"
      >
        <div className="flex flex-col gap-1">
          <p className="font-heading text-sm tracking-wide text-ink-muted uppercase">
            {t("branchesTitle")}
          </p>
          <p className="text-lg text-ink">
            {t("branchesSummary", {
              published: publishedCount,
              total: branches.length,
            })}
          </p>
        </div>
        <IconArrowNarrowRight className="size-6 text-ink-muted transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
      </Link>
    </div>
  )
}
