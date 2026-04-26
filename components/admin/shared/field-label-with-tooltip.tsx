"use client"

import * as React from "react"
import { IconInfoCircle } from "@tabler/icons-react"

import { FieldLabel } from "@/components/ui/field"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function FieldLabelWithTooltip({
  children,
  tooltip,
  required,
  className,
}: {
  children: React.ReactNode
  tooltip?: string
  required?: boolean
  className?: string
}) {
  return (
    <FieldLabel className={cn("flex items-center gap-1.5", className)}>
      <span>
        {children}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={tooltip}
                className="inline-flex size-3.5 items-center justify-center text-ink-muted hover:text-ink focus-visible:text-ink"
              >
                <IconInfoCircle className="size-3.5" aria-hidden />
              </button>
            }
          />
          <TooltipContent className="max-w-xs text-start">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </FieldLabel>
  )
}
