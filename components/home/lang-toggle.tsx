"use client"

import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"

import { cn } from "@/lib/utils"

// Matches LOCALE_COOKIE in i18n/request.ts (kept in sync manually so this
// client component doesn't import the server-only request config).
const LOCALE_COOKIE = "NEXT_LOCALE"

export function LangToggle({ className }: { className?: string }) {
  const locale = useLocale()
  const router = useRouter()

  const next = locale === "he" ? "en" : "he"
  // Show the language the toggle switches TO.
  const label = locale === "he" ? "EN" : "עב"

  const switchLocale = () => {
    // Persist so the server renders the same locale on the next request.
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365}`
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={locale === "he" ? "Switch to English" : "עבור לעברית"}
      className={cn(
        "glow-primary hover:glow-cyan rounded-sm border border-primary bg-card px-3.5 py-2 font-heading text-sm font-extrabold text-foreground transition-colors hover:border-secondary hover:text-secondary",
        className
      )}
    >
      {label}
    </button>
  )
}
