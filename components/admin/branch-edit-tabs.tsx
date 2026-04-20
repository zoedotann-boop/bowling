"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs"

const LIVE_TABS = [
  "info",
  "hero",
  "seo",
  "hours",
  "prices",
  "packages",
  "events",
  "menu",
] as const

const DISABLED_TABS = ["reviews"] as const

type Props = {
  infoHeroSeoPanel: React.ReactNode
  hoursPanel: React.ReactNode
  pricesPanel: React.ReactNode
  packagesPanel: React.ReactNode
  eventsPanel: React.ReactNode
  menuPanel: React.ReactNode
}

export function BranchEditTabs({
  infoHeroSeoPanel,
  hoursPanel,
  pricesPanel,
  packagesPanel,
  eventsPanel,
  menuPanel,
}: Props) {
  const tTabs = useTranslations("Admin.branches.tabs")

  return (
    <Tabs defaultValue="info">
      <TabsList className="flex-wrap">
        {LIVE_TABS.map((tab) => (
          <TabsTab key={tab} value={tab}>
            {tTabs(tab)}
          </TabsTab>
        ))}
        {DISABLED_TABS.map((tab) => (
          <TabsTab
            key={tab}
            value={tab}
            disabled
            className="gap-1.5"
            title={tTabs("comingSoon")}
          >
            {tTabs(tab)}
            <span className="rounded-none bg-muted px-1 py-0.5 text-[10px] tracking-wide text-ink-muted uppercase">
              {tTabs("soon")}
            </span>
          </TabsTab>
        ))}
      </TabsList>
      {infoHeroSeoPanel}
      <TabsPanel value="hours">{hoursPanel}</TabsPanel>
      <TabsPanel value="prices">{pricesPanel}</TabsPanel>
      <TabsPanel value="packages">{packagesPanel}</TabsPanel>
      <TabsPanel value="events">{eventsPanel}</TabsPanel>
      <TabsPanel value="menu">{menuPanel}</TabsPanel>
    </Tabs>
  )
}
