import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { GalleryPage } from "@/components/pages/gallery-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("gallery") }
}

export default function Page() {
  return <GalleryPage />
}
