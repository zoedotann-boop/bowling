import { Contact } from "@/components/home/contact"
import { FeatureStrip } from "@/components/home/feature-strip"
import { Gallery } from "@/components/home/gallery"
import { Gymboree } from "@/components/home/gymboree"
import { Hero } from "@/components/home/hero"
import { Pricing } from "@/components/home/pricing"
import { Reviews } from "@/components/home/reviews"
import { Services } from "@/components/home/services"

// Concrete canvas. Sections are unified but separated by a subtle tonal step.
export default function Page() {
  return (
    <>
      <Hero />
      <div className="bg-[#141517]">
        <FeatureStrip />
      </div>
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
    </>
  )
}
