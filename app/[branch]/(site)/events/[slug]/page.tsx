import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { EventDetailPage } from "@/components/pages/event-detail-page"
import { byBranch } from "@/lib/branches"
import { getEvents, logError } from "@/lib/db/queries/site"
import { defaultBookingFields } from "@/lib/events/detail-defaults"
import { BUILT_IN_EVENTS } from "@/lib/events/slugs"
import { pickLocale } from "@/lib/localized"
import type { Locale } from "@/lib/locales"

export function generateStaticParams() {
  return BUILT_IN_EVENTS.map((slug) => ({ slug }))
}

async function loadEvents() {
  return getEvents().catch(logError("getEvents", []))
}

function findEventType(
  events: Awaited<ReturnType<typeof loadEvents>>,
  slug: string
) {
  return events
    .flatMap((branch) => branch.eventTypes)
    .find((type) => type.slug === slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [t, brand, locale, events] = await Promise.all([
    getTranslations("eventDetails"),
    getTranslations(),
    getLocale(),
    loadEvents(),
  ])
  const title = t.has(`items.${slug}.title`)
    ? t(`items.${slug}.title`)
    : pickLocale(findEventType(events, slug)?.name, locale as Locale)
  return title ? { title: `${title} · ${brand("brand")}` } : {}
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const events = await loadEvents()
  const builtIn = (BUILT_IN_EVENTS as readonly string[]).includes(slug)
  if (!builtIn && !findEventType(events, slug)) notFound()
  return (
    <EventDetailPage
      slug={slug}
      events={byBranch(events)}
      defaultFormFields={defaultBookingFields()}
    />
  )
}
