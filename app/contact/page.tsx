import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { Contact } from "@/components/home/contact"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("contact") }
}

export default function Page() {
  return <Contact />
}
