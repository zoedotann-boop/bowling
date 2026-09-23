"use client"

import { Tooltip } from "@base-ui/react/tooltip"
import { Info } from "lucide-react"

// A small "?" info affordance that reveals helper text on hover/focus. Used by
// AdminField and RowTable column headers via the `tooltip`/`fooTip` convention.
export function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <button
            type="button"
            aria-label={text}
            className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        }
      >
        <Info className="size-3.5" />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6}>
          <Tooltip.Popup className="max-w-64 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
            {text}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
