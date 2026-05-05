"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  IconCheck,
  IconChevronDown,
  IconMapPin,
  IconPlus,
} from "@tabler/icons-react"

import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type BranchOption = {
  slug: string
  displayName: string
}

function extractBranchSlug(pathname: string): string | null {
  const match = pathname.match(/\/admin\/branches\/([^/]+)(?:\/|$)/)
  if (!match) return null
  const slug = match[1]!
  if (slug === "new") return null
  return slug
}

export function AdminBranchSwitcher({
  branches,
}: {
  branches: BranchOption[]
}) {
  const t = useTranslations("Admin.nav")
  const router = useRouter()
  const pathname = usePathname()
  const currentSlug = extractBranchSlug(pathname)
  const active =
    branches.find((b) => b.slug === currentSlug) ?? branches[0] ?? null

  function pick(slug: string) {
    if (currentSlug) {
      const next = pathname.replace(
        /\/admin\/branches\/[^/]+/,
        `/admin/branches/${slug}`
      )
      router.push(next)
    } else {
      router.push(`/admin/branches/${slug}/general`)
    }
  }

  if (!active) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 px-3"
        render={
          <Link href="/admin/branches/new">
            <IconPlus className="size-4" aria-hidden />
            {t("createBranch")}
          </Link>
        }
      />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 px-3"
            aria-label={t("pickBranch")}
          />
        }
      >
        <IconMapPin className="size-4" aria-hidden />
        <span className="text-sm font-bold">{active.displayName}</span>
        <IconChevronDown className="size-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[260px]">
        <DropdownMenuLabel>{t("pickBranch")}</DropdownMenuLabel>
        {branches.map((b) => {
          const isActive = b.slug === active.slug
          return (
            <DropdownMenuItem
              key={b.slug}
              onClick={() => pick(b.slug)}
              className="flex items-start gap-3 py-2.5"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper">
                <IconMapPin className="size-3" aria-hidden />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs font-medium text-ink">
                  {b.displayName}
                </span>
                <span className="truncate font-mono text-[11px] text-ink-muted">
                  {b.slug}
                </span>
              </div>
              {isActive ? (
                <IconCheck className="size-4 shrink-0" aria-hidden />
              ) : null}
            </DropdownMenuItem>
          )
        })}
        <div className="my-1 h-px bg-line" role="separator" />
        <DropdownMenuItem render={<Link href="/admin/branches/new" />}>
          <IconPlus className="size-4 shrink-0" />
          <span className="text-xs font-medium text-ink">
            {t("createBranch")}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
