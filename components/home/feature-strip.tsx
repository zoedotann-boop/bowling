import Image from "next/image"
import { useTranslations } from "next-intl"

import { Container } from "./container"

const IMAGES = [
  "/balls/orange.png",
  "/balls/teal.png",
  "/balls/mustard.png",
  "/balls/pink.png",
]

export function FeatureStrip() {
  const t = useTranslations()
  const features = t.raw("features") as { title: string; desc: string }[]

  return (
    <Container className="pt-6 pb-1 lg:pt-11 lg:pb-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-[18px]">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="rounded-[18px] border-[4px] border-dotted border-navy p-4 lg:rounded-[20px] lg:p-[22px]"
          >
            <div className="size-12 overflow-hidden rounded-full border-[3px] border-navy bg-cream lg:size-[58px]">
              <Image
                src={IMAGES[i]}
                alt=""
                width={58}
                height={58}
                className="size-full object-cover"
              />
            </div>
            <div className="mt-2.5 font-heading text-base font-extrabold text-navy lg:mt-3.5 lg:text-[19px]">
              {f.title}
            </div>
            <div className="mt-1 text-[13px] font-semibold text-mud lg:text-sm">
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
