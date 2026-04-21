import type { Metadata } from "next"
import { notFound } from "next/navigation"

import type { Locale } from "@/i18n/routing"
import * as services from "@/lib/services"
import { BranchHoursForm } from "@/components/admin/branch-hours-form"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch hours",
  robots: { index: false, follow: false },
}

export default async function BranchHoursPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()

  const hoursInitial = await services.hours.listByBranch(slug)

  return <BranchHoursForm branchId={loaded.row.id} initialRows={hoursInitial} />
}
