"use client"

import { useLocale, useTranslations } from "next-intl"

import { featureIconAt, type FeatureIcon } from "@/lib/home"
import { pickLocale } from "@/lib/localized"
import { useBranch } from "@/components/branch-context"
import { useSiteContent } from "@/components/site-content-context"
import {
  BarIcon,
  EveryoneIcon,
  LanesIcon,
  OpenLateIcon,
} from "@/components/icons"
import { LedCorners } from "@/components/decor/led-corners"
import { Container } from "./container"

const ICONS: Record<FeatureIcon, typeof LanesIcon> = {
  lanes: LanesIcon,
  everyone: EveryoneIcon,
  bar: BarIcon,
  openLate: OpenLateIcon,
}

export function FeatureStrip() {
  const t = useTranslations()
  const { branch } = useBranch()
  const locale = useLocale() as "he" | "en"
  const content = useSiteContent()
  const features = content
    ? content.features.map((f) => ({
        icon: f.icon,
        title: pickLocale(f.label, locale),
        desc: pickLocale(f.description, locale),
      }))
    : (t.raw("features") as { title: string; desc: string }[]).map((f, i) => ({
        icon: "",
        title: f.title,
        desc: i === 0 ? branch.laneDesc[locale] : f.desc,
      }))

  if (features.length === 0) return null

  return (
    <Container className="pt-6 pb-1 lg:pt-11 lg:pb-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-[18px]">
        {features.map((f, i) => {
          const Icon = ICONS[featureIconAt(f.icon, i)]
          return (
            <div key={i} className="relative bg-card p-5 lg:p-[26px]">
              <LedCorners />
              <Icon className="h-14 w-auto lg:h-[70px]" />
              <div className="mt-2.5 font-heading text-base font-extrabold text-navy lg:mt-3.5 lg:text-[19px]">
                {f.title}
              </div>
              <div className="mt-1 text-[13px] font-medium text-mud lg:text-sm">
                {f.desc}
              </div>
            </div>
          )
        })}
      </div>
    </Container>
  )
}
