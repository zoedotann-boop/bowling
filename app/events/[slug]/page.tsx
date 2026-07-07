import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { EventDetailPage } from "@/components/pages/event-detail-page"

const SLUGS = ["birthdays", "no-room", "team", "gymboree", "corporate"] as const

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!SLUGS.includes(slug as (typeof SLUGS)[number])) return {}
  const t = await getTranslations("eventDetails")
  const brand = await getTranslations()
  return { title: `${t(`items.${slug}.title`)} · ${brand("brand")}` }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!SLUGS.includes(slug as (typeof SLUGS)[number])) notFound()
  return <EventDetailPage slug={slug} />
}
