import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { SiteChrome } from "@/components/site-chrome"
import { branchIds, BRANCHES, isBranchId } from "@/lib/branches"
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
  const [t, locale] = await Promise.all([
    getTranslations("metadata"),
    getLocale(),
  ])
  return {
    title: t("branchTitle", {
      branch: BRANCHES[branch].name[locale as Locale],
    }),
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
  return <SiteChrome branchId={branch}>{children}</SiteChrome>
}
