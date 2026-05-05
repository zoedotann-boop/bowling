import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { hasLocale } from "next-intl"
import { routing, type Locale } from "@/i18n/routing"
import { loadSiteBranch } from "@/lib/site-branch"
import { Hero } from "@/components/sections/hero"
import { ServiceCards } from "@/components/sections/service-cards"
import { PricingPreview } from "@/components/sections/pricing-preview"
import { BirthdaysTeaser } from "@/components/sections/birthdays-teaser"
import { SiteGallery } from "@/components/sections/site-gallery"
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
      <ServiceCards />
      <PricingPreview branch={branch} />
      <BirthdaysTeaser />
      <SiteGallery branch={branch} />
      <GoogleReviews branch={branch} />
      <ContactBlock branch={branch} />
    </>
  )
}
