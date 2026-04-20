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
      className={cn("flex items-center gap-1 border-b border-line", className)}
      {...props}
    />
  )
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "relative inline-flex h-8 shrink-0 items-center gap-1.5 px-3 text-xs font-medium text-ink-muted transition-colors outline-none hover:text-ink focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[selected]:text-ink data-[selected]:after:absolute data-[selected]:after:inset-x-0 data-[selected]:after:-bottom-px data-[selected]:after:h-0.5 data-[selected]:after:bg-primary",
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
