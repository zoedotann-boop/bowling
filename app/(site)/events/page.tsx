import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { EventsPage } from "@/components/pages/events-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("events") }
}

export default function Page() {
  return <EventsPage />
}
