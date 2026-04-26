import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { hasLocale } from "next-intl"
import { routing, type Locale } from "@/i18n/routing"
import { loadSiteBranch } from "@/lib/site-branch"
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
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const branch = await loadSiteBranch(locale)
  if (!branch) notFound()

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
