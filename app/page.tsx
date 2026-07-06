import { Contact } from "@/components/home/contact"
import { FeatureStrip } from "@/components/home/feature-strip"
import { Gallery } from "@/components/home/gallery"
import { Hero } from "@/components/home/hero"
import { Pricing } from "@/components/home/pricing"
import { PromoBar } from "@/components/home/promo-bar"
import { Reviews } from "@/components/home/reviews"
import { Services } from "@/components/home/services"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"

export default function Page() {
  return (
    <div className="min-h-svh bg-cream">
      <PromoBar />
      <SiteHeader />
      <Hero />
      <FeatureStrip />
      <Services />
      <Pricing />
      <Gallery />
      <Reviews />
      <Contact />
      <SiteFooter />
    </div>
  )
}
