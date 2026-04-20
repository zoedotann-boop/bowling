"use client"

import { useTheme } from "next-themes"
import { Toaster as SonnerToaster, type ToasterProps } from "sonner"

function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme()
  return (
    <SonnerToaster
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "system"}
      toastOptions={{
        classNames: {
          toast:
            "group rounded-none border border-line bg-surface text-ink shadow-md",
          description: "text-ink-muted",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-ink",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
