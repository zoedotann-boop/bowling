import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { GiftCardPage } from "@/components/pages/gift-card-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("giftCard") }
}

export default function Page() {
  return <GiftCardPage />
}
