"use client"

import { useTranslations, useLocale } from "next-intl"
import { IconBuildingStore, IconCheck, IconChevronDown } from "@tabler/icons-react"
import { branches, type Branch } from "@/lib/branches"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const accentDot: Record<Branch["brandAccent"], string> = {
  cherry: "bg-ticket-red",
  teal: "bg-banner-teal",
}

export function BranchSwitcher({ currentSlug }: { currentSlug: string }) {
  const t = useTranslations("BranchSwitcher")
  const locale = useLocale()
  const current = branches.find((b) => b.slug === currentSlug) ?? branches[0]
  const isProd = process.env.NODE_ENV === "production"

  function selectBranch(branch: Branch) {
    if (branch.slug === current.slug) return
    if (isProd && branch.domains[0]) {
      const path = window.location.pathname + window.location.search
      window.location.assign(`https://${branch.domains[0]}${path}`)
      return
    }
    const url = new URL(window.location.href)
    url.searchParams.set("branch", branch.slug)
    window.location.assign(url.toString())
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="sm"
            variant="ghost"
            className="h-10 gap-2 rounded-full px-3 text-ink hover:bg-surface-muted"
            aria-label={t("open")}
          />
        }
      >
        <IconBuildingStore className="size-4 text-ink-muted" aria-hidden />
        <span
          className={cn("size-2 rounded-full", accentDot[current.brandAccent])}
          aria-hidden
        />
        <span className="hidden text-sm font-medium sm:inline">
          {current.shortName[locale as keyof typeof current.shortName]}
        </span>
        <IconChevronDown className="size-3.5 text-ink-muted" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl border border-line bg-surface p-1.5 shadow-card">
        <DropdownMenuLabel className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
          {t("title")}
        </DropdownMenuLabel>
        {branches.map((b) => {
          const isCurrent = b.slug === current.slug
          return (
            <DropdownMenuItem
              key={b.slug}
              onClick={() => selectBranch(b)}
              className="flex items-start gap-3 rounded-xl px-3 py-3"
            >
              <span
                className={cn(
                  "mt-1 size-2 shrink-0 rounded-full",
                  accentDot[b.brandAccent],
                )}
                aria-hidden
              />
              <div className="flex min-w-0 flex-col text-start">
                <span className="text-sm font-medium text-ink">
                  {b.displayName[locale as keyof typeof b.displayName]}
                </span>
                <span className="truncate text-xs text-ink-muted">
                  {b.address[locale as keyof typeof b.address]}
                </span>
              </div>
              {isCurrent && (
                <IconCheck className="ms-auto size-4 text-ink" aria-hidden />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
