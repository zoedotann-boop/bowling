import { Contact } from "@/components/home/contact"
import { FeatureStrip } from "@/components/home/feature-strip"
import { Gallery } from "@/components/home/gallery"
import { Gymboree } from "@/components/home/gymboree"
import { Hero } from "@/components/home/hero"
import { HomeContentProvider } from "@/components/home/home-content-context"
import { Pricing } from "@/components/home/pricing"
import { Reviews } from "@/components/home/reviews"
import { Services } from "@/components/home/services"
import { SloganStrip } from "@/components/home/slogan-strip"
import { getHomeContentByBranch } from "@/lib/db/queries/site"

// Concrete canvas. Sections are unified but separated by a subtle tonal step.
export default async function Page() {
  // Load admin-editable content for every branch; fall back to translated
  // defaults if the database is unavailable so the page never breaks.
  const content = await getHomeContentByBranch().catch(() => ({}))

  return (
    <HomeContentProvider content={content}>
      <Hero />
      <div className="bg-[#141517]">
        <FeatureStrip />
      </div>
      <SloganStrip />
      <div className="bg-[#191b1d]">
        <Services />
      </div>
      <div className="bg-[#141517]">
        <Pricing />
      </div>
      <div className="bg-[#191b1d]">
        <Gymboree />
      </div>
      <div className="bg-[#141517]">
        <Gallery />
      </div>
      <div className="bg-[#191b1d]">
        <Reviews />
      </div>
      <div className="bg-[#141517]">
        <Contact />
      </div>
    </HomeContentProvider>
  )
}
