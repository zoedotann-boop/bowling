import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { WaiverPage } from "@/components/pages/waiver-page"
import { byBranch, isBranchId } from "@/lib/branches"
import { getEvents, getSiteBranches, logError } from "@/lib/db/queries/site"
import { defaultBookingFields } from "@/lib/events/detail-defaults"
import { waiverEventTitle } from "@/lib/events/waiver"
import type { Locale } from "@/lib/locales"

interface Params {
  params: Promise<{ branch: string; slug: string }>
}

async function loadWaiver({ params }: Params) {
  const { branch, slug } = await params
  if (!isBranchId(branch)) return null
  const [locale, branches, events] = await Promise.all([
    getLocale(),
    getSiteBranches(),
    getEvents().catch(logError("getEvents", [])),
  ])
  const eventTypes = byBranch(events)[branch]?.eventTypes ?? []
  const event = waiverEventTitle({
    branchId: branch,
    slug,
    locale: locale as Locale,
    eventTypes,
    branchEvents: branches[branch].events,
  })
  return event === null
    ? null
    : { event, branch: branches[branch], slug, eventTypes }
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const [t, loaded] = await Promise.all([
    getTranslations("eventDetails.form"),
    loadWaiver(props),
  ])
  return {
    title: loaded ? `${t("title")} · ${loaded.event}` : t("title"),
    robots: { index: false, follow: false },
  }
}

export default async function Page(props: Params) {
  const loaded = await loadWaiver(props)
  if (!loaded) notFound()
  return (
    <WaiverPage
      branch={loaded.branch}
      slug={loaded.slug}
      eventTypes={loaded.eventTypes}
      defaultFormFields={defaultBookingFields()}
    />
  )
}
