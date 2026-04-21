import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-none border-2 border-ink bg-paper px-3 py-2 text-sm text-ink shadow-block-sm transition-[box-shadow,transform] outline-none placeholder:text-ink-soft focus-visible:shadow-block disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-2 aria-invalid:shadow-[2px_2px_0_var(--red-2)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
