import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { routing, type Locale } from "@/i18n/routing"
import { loadSiteBranch, listPublishedBranches } from "@/lib/site-branch"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteTopbar } from "@/components/layout/site-topbar"
import { SiteFooter } from "@/components/layout/site-footer"
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp"
import { Ticker } from "@/components/common/ticker"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const l = locale as Locale
  const branch = await loadSiteBranch(l)
  if (!branch) return {}

  return {
    title: branch.seo.title,
    description: branch.seo.description,
    openGraph: {
      title: branch.seo.title,
      description: branch.seo.description,
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
  const [branch, branches] = await Promise.all([
    loadSiteBranch(locale as Locale),
    listPublishedBranches(locale as Locale),
  ])
  if (!branch) notFound()
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
    name: branch.displayName,
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: branch.city,
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
    <div className="relative flex min-h-svh flex-col">
      <SiteTopbar branch={branch} />
      <SiteHeader branch={branch} branches={branches} />
      <Ticker items={tickerItems} />
      <main className="flex-1">{children}</main>
      <SiteFooter branch={branch} />
      <FloatingWhatsApp branch={branch} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </div>
  )
}
