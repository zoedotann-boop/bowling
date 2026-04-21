"use client"

import { useTransition } from "react"
import { useTranslations } from "next-intl"
import {
  IconBuildingStore,
  IconCheck,
  IconChevronDown,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BranchOption } from "@/lib/site-branch"
import { selectBranch } from "@/app/[locale]/(site)/_actions/branch"

export function BranchSwitcher({
  branches,
  currentSlug,
}: {
  branches: BranchOption[]
  currentSlug: string
}) {
  const t = useTranslations("BranchSwitcher")
  const [pending, startTransition] = useTransition()

  if (branches.length < 2) return null

  const current = branches.find((b) => b.slug === currentSlug) ?? branches[0]!

  function choose(slug: string) {
    if (slug === current.slug || pending) return
    startTransition(() => {
      void selectBranch(slug)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 px-3"
            aria-label={t("open")}
            disabled={pending}
          />
        }
      >
        <IconBuildingStore className="size-4" aria-hidden />
        <span className="hidden text-sm font-bold sm:inline">
          {current.shortName}
        </span>
        <IconChevronDown className="size-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
        {branches.map((b) => {
          const isCurrent = b.slug === current.slug
          return (
            <DropdownMenuItem
              key={b.slug}
              onClick={() => choose(b.slug)}
              className="flex items-start gap-3 py-2.5"
            >
              <div className="flex-1">
                <div className="font-bold text-ink">{b.shortName}</div>
                {b.city && (
                  <div className="font-mono text-[10px] tracking-[0.14em] text-ink-soft uppercase">
                    {b.city}
                  </div>
                )}
              </div>
              {isCurrent && (
                <IconCheck className="size-4 text-ink" aria-hidden />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
