"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"

import { cn } from "@/lib/utils"
import { setLocale } from "@/i18n/actions"

export function LangToggle({ className }: { className?: string }) {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const next = locale === "he" ? "en" : "he"
  // Show the language the toggle switches TO.
  const label = locale === "he" ? "EN" : "עב"

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setLocale(next)
          router.refresh()
        })
      }
      aria-label={locale === "he" ? "Switch to English" : "עבור לעברית"}
      className={cn(
        "rounded-full border-[3px] border-navy bg-paper px-3.5 py-2 font-heading text-sm font-extrabold text-navy transition-colors hover:bg-marigold disabled:opacity-60",
        className
      )}
    >
      {label}
    </button>
  )
}
