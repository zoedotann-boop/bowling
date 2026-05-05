"use client"

import * as React from "react"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs"

export function PricelistsTabs({
  labels,
  food,
  games,
  birthdays,
}: {
  labels: { food: string; games: string; birthdays: string }
  food: React.ReactNode
  games: React.ReactNode
  birthdays: React.ReactNode
}) {
  return (
    <Tabs defaultValue="food">
      <TabsList>
        <TabsTab value="food">{labels.food}</TabsTab>
        <TabsTab value="games">{labels.games}</TabsTab>
        <TabsTab value="birthdays">{labels.birthdays}</TabsTab>
      </TabsList>
      <TabsPanel value="food">{food}</TabsPanel>
      <TabsPanel value="games">{games}</TabsPanel>
      <TabsPanel value="birthdays">{birthdays}</TabsPanel>
    </Tabs>
  )
}
