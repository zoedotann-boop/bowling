import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-10 w-full min-w-0 rounded-none border-2 border-ink bg-paper px-3 py-2 text-sm text-ink shadow-block-sm transition-[box-shadow,transform] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink placeholder:text-ink-soft focus-visible:shadow-block disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-2 aria-invalid:shadow-[2px_2px_0_var(--red-2)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
