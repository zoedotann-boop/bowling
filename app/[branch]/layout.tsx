import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { SiteChrome } from "@/components/site-chrome"
import { branchIds, isBranchId } from "@/lib/branches"
import { getSiteBranches } from "@/lib/db/queries/site"
import type { Locale } from "@/lib/locales"

export const dynamicParams = false

export function generateStaticParams() {
  return branchIds.map((branch) => ({ branch }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ branch: string }>
}): Promise<Metadata> {
  const { branch } = await params
  if (!isBranchId(branch)) return {}
  const [t, locale, branches] = await Promise.all([
    getTranslations("metadata"),
    getLocale(),
    getSiteBranches(),
  ])
  const { name, seoTitle, seoDescription } = branches[branch]
  const lang = locale as Locale
  return {
    title: seoTitle?.[lang] || t("branchTitle", { branch: name[lang] }),
    description: seoDescription?.[lang] || undefined,
  }
}

export default async function BranchLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ branch: string }>
}) {
  const { branch } = await params
  if (!isBranchId(branch)) notFound()
  const branches = await getSiteBranches()
  if (!branches[branch].isVisible) notFound()
  return <SiteChrome branchId={branch}>{children}</SiteChrome>
}
