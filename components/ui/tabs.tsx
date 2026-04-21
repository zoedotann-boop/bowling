"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-none border-2 border-ink bg-paper px-3 text-sm font-bold text-ink shadow-block-sm transition-transform outline-none hover:bg-cream disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-red data-[selected]:text-white data-[selected]:shadow-block [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function TabsPanel({
  className,
  keepMounted = true,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      keepMounted={keepMounted}
      className={cn(
        "flex flex-col gap-4 outline-none data-[hidden]:hidden",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTab, TabsPanel }
