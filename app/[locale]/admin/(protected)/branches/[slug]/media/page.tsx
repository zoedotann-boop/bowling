import type { Metadata } from "next"
import { notFound } from "next/navigation"

import type { Locale } from "@/i18n/routing"
import * as services from "@/lib/services"
import { MediaLibraryClient } from "@/components/admin/media/media-library-client"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch media",
  robots: { index: false, follow: false },
}

export default async function BranchMediaPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()
  const items = await services.media.listByBranch(loaded.row.id)
  return <MediaLibraryClient items={items} branchId={loaded.row.id} />
}
