"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-6 w-11 shrink-0 items-center rounded-none border-2 border-ink bg-cream-2 shadow-block-sm transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-red",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 translate-x-0.5 rounded-none border-2 border-ink bg-paper transition-transform data-[checked]:translate-x-[1.125rem] rtl:data-[checked]:-translate-x-[1.125rem]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
