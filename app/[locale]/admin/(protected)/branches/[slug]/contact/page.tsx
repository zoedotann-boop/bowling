import type { Metadata } from "next"
import { notFound } from "next/navigation"

import type { Locale } from "@/i18n/routing"
import {
  BranchContactForm,
  type BranchContactInitial,
} from "@/components/admin/branch/branch-contact-form"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch contact",
  robots: { index: false, follow: false },
}

export default async function BranchContactPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()
  const { row } = loaded

  const initial: BranchContactInitial = {
    id: row.id,
    slug: row.slug,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    mapUrl: row.mapUrl,
  }

  return <BranchContactForm initial={initial} />
}
