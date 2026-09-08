"use client"

import { useLocale, useTranslations } from "next-intl"

import { useBranch } from "@/components/branch-context"
import {
  BarIcon,
  EveryoneIcon,
  LanesIcon,
  OpenLateIcon,
} from "@/components/icons"
import { LedCorners } from "@/components/decor/led-corners"
import { Container } from "./container"

// Custom bowling line icons — matched to the features order in messages
// (new lanes, suits-everyone, bar & restaurant, open until 3am).
const ICONS = [LanesIcon, EveryoneIcon, BarIcon, OpenLateIcon]

export function FeatureStrip() {
  const t = useTranslations()
  const { branch } = useBranch()
  const locale = useLocale() as "he" | "en"
  const features = t.raw("features") as { title: string; desc: string }[]

  return (
    <Container className="pt-6 pb-1 lg:pt-11 lg:pb-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-[18px]">
        {features.map((f, i) => {
          const Icon = ICONS[i] ?? ICONS[0]
          return (
            <div key={f.title} className="relative bg-card p-5 lg:p-[26px]">
              <LedCorners />
              <Icon className="h-14 w-auto lg:h-[70px]" />
              <div className="mt-2.5 font-heading text-base font-extrabold text-navy lg:mt-3.5 lg:text-[19px]">
                {f.title}
              </div>
              <div className="mt-1 text-[13px] font-medium text-mud lg:text-sm">
                {i === 0 ? branch.laneDesc[locale] : f.desc}
              </div>
            </div>
          )
        })}
      </div>
    </Container>
  )
}
