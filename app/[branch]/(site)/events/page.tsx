import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { EventsPage } from "@/components/pages/events-page"
import { byBranch } from "@/lib/branches"
import { getEvents, logError } from "@/lib/db/queries/site"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("events") }
}

export default async function Page() {
  const events = byBranch(await getEvents().catch(logError("getEvents", [])))
  return <EventsPage events={events} />
}
