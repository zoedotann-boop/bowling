"use client"

import { Tabs } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

export interface AdminTab {
  value: string
  label: string
  content: React.ReactNode
}

export function AdminTabs({
  tabs,
  value,
  onValueChange,
  stretch = false,
  className,
}: {
  tabs: AdminTab[]
  value?: string
  onValueChange?: (value: string) => void
  stretch?: boolean
  className?: string
}) {
  return (
    <Tabs.Root
      defaultValue={tabs[0]?.value}
      value={value}
      onValueChange={(next) => onValueChange?.(String(next))}
      className={cn("space-y-4", className)}
    >
      <Tabs.List className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            className={cn(
              "h-8 shrink-0 rounded-md px-3 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none select-none not-data-active:hover:bg-muted not-data-active:hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-active:bg-primary data-active:text-primary-foreground",
              stretch && "flex-1"
            )}
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Panel
          key={tab.value}
          value={tab.value}
          className="space-y-4 outline-none"
        >
          {tab.content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
