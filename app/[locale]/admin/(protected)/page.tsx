import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { asc } from "drizzle-orm"
import { IconArrowUpLeft, IconBuildingStore } from "@tabler/icons-react"

import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import { branch } from "@/lib/db/schema/content"

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

  const [any] = await db.select({ id: branch.id }).from(branch).limit(1)
  const hasBranches = Boolean(any)

  const firstBranchSlug = hasBranches
    ? (
        await db
          .select({ slug: branch.slug })
          .from(branch)
          .orderBy(asc(branch.sortOrder))
          .limit(1)
      )[0]?.slug
    : null

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center">
      <Card className="flex w-full flex-col items-center gap-4 p-8 text-center sm:p-12">
        <div
          aria-hidden
          className="grid size-12 place-items-center border-2 border-ink bg-surface text-ink"
        >
          <IconBuildingStore className="size-6" />
        </div>
        <h1 className="font-display text-2xl tracking-tight text-ink">
          {t("title")}
        </h1>
        {hasBranches ? (
          <>
            <p className="flex items-center gap-1.5 text-sm text-ink-muted">
              <IconArrowUpLeft className="size-4 rtl:rotate-90" aria-hidden />
              {t("pickFromSidebar")}
            </p>
            {firstBranchSlug ? (
              <Button
                size="sm"
                render={
                  <Link href={`/admin/branches/${firstBranchSlug}/info`}>
                    {t("jumpToFirst")}
                  </Link>
                }
              />
            ) : null}
          </>
        ) : (
          <>
            <p className="text-sm text-ink-muted">{t("noBranches")}</p>
            <Button
              size="sm"
              render={
                <Link href="/admin/branches/new">{t("createFirst")}</Link>
              }
            />
          </>
        )}
      </Card>
    </div>
  )
}
