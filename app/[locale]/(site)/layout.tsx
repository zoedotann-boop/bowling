import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { getCurrentBranch } from "@/lib/branch-context"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteTopbar } from "@/components/layout/site-topbar"
import { SiteFooter } from "@/components/layout/site-footer"
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp"
import { Ticker } from "@/components/common/ticker"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const branch = await getCurrentBranch()
  const l = locale as Locale

  return {
    title: branch.seo.title[l],
    description: branch.seo.description[l],
    openGraph: {
      title: branch.seo.title[l],
      description: branch.seo.description[l],
      locale: l,
      type: "website",
    },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `/${loc}`])
      ),
    },
  }
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const branch = await getCurrentBranch()
  const l = locale as Locale
  const tTicker = await getTranslations("Ticker")
  const tickerItems = [
    tTicker("item1"),
    tTicker("item2"),
    tTicker("item3"),
    tTicker("item4"),
    tTicker("item5"),
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BowlingAlley",
    name: branch.displayName[l],
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address[l],
      addressLocality: branch.city[l],
    },
    telephone: branch.phone,
    email: branch.email,
    geo: {
      "@type": "GeoCoordinates",
      latitude: branch.geo.lat,
      longitude: branch.geo.lng,
    },
    image: branch.hero.image,
  }

  return (
    <div
      data-branch-accent={branch.brandAccent}
      className="relative flex min-h-svh flex-col"
    >
      <SiteTopbar branch={branch} />
      <SiteHeader branch={branch} />
      <Ticker items={tickerItems} />
      <main className="flex-1">{children}</main>
      <SiteFooter branch={branch} />
      <FloatingWhatsApp branch={branch} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </div>
  )
}
