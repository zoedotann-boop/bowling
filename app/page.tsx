import { Contact } from "@/components/home/contact"
import { FeatureStrip } from "@/components/home/feature-strip"
import { Gallery } from "@/components/home/gallery"
import { Hero } from "@/components/home/hero"
import { Pricing } from "@/components/home/pricing"
import { Reviews } from "@/components/home/reviews"
import { Services } from "@/components/home/services"

export default function Page() {
  return (
    <>
      <Hero />
      <FeatureStrip />
      <Services />
      <Pricing />
      <Gallery />
      <Reviews />
      <Contact />
    </>
  )
}
