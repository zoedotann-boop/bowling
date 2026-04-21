import { setRequestLocale } from "next-intl/server"
import type { Locale } from "@/i18n/routing"
import { getCurrentBranch } from "@/lib/branch-context"
import { Hero } from "@/components/sections/hero"
import { QuickActions } from "@/components/sections/quick-actions"
import { PricingPreview } from "@/components/sections/pricing-preview"
import { MenuSection } from "@/components/sections/menu-section"
import { EventsTeaser } from "@/components/sections/events-teaser"
import { GoogleReviews } from "@/components/sections/google-reviews"
import { ContactBlock } from "@/components/sections/contact-block"

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const branch = await getCurrentBranch()

  return (
    <>
      <Hero branch={branch} />
      <QuickActions />
      <PricingPreview branch={branch} />
      <MenuSection branch={branch} />
      <EventsTeaser branch={branch} />
      <GoogleReviews branch={branch} />
      <ContactBlock branch={branch} />
    </>
  )
}
