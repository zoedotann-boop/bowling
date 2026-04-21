import type { Metadata } from "next"
import { notFound } from "next/navigation"

import type { Locale } from "@/i18n/routing"
import * as services from "@/lib/services"
import { BranchReviewsForm } from "@/components/admin/branch-reviews-form"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch reviews",
  robots: { index: false, follow: false },
}

export default async function BranchReviewsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()
  const { row } = loaded

  const [cacheStatus, reviews] = await Promise.all([
    services.reviews.getCacheStatus(row.id),
    services.reviews.listForBranch(row.id, locale as Locale),
  ])

  return (
    <BranchReviewsForm
      branchId={row.id}
      slug={row.slug}
      googlePlaceId={row.googlePlaceId}
      cacheStatus={cacheStatus}
      initialReviews={reviews}
    />
  )
}
