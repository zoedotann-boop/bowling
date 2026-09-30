"use client"

import { Popover } from "@base-ui/react/popover"
import { Info } from "lucide-react"

import { useDialogContainer } from "./admin-modal"

export function InfoTooltip({ text }: { text: string }) {
  const dialog = useDialogContainer()

  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={150}
        aria-label={text}
        className="inline-flex size-5 cursor-help items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[popup-open]:text-foreground"
      >
        <Info className="size-3.5" />
      </Popover.Trigger>
      <Popover.Portal container={dialog ?? undefined}>
        <Popover.Positioner
          side="top"
          sideOffset={6}
          collisionPadding={8}
          positionMethod="fixed"
          className="z-50"
        >
          <Popover.Popup className="max-w-72 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs leading-relaxed font-normal text-popover-foreground shadow-md outline-none">
            {text}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
