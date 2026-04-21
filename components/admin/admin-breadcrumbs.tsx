"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/i18n/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type Crumb = {
  href: string | null
  label: string
}

type AdminBreadcrumbsProps = {
  slugLabels?: Record<string, string>
}

export function AdminBreadcrumbs({ slugLabels = {} }: AdminBreadcrumbsProps) {
  const pathname = usePathname()
  const tNav = useTranslations("Admin.nav")
  const tForm = useTranslations("Admin.branches.form")
  const tTabs = useTranslations("Admin.branches.tabs")

  const crumbs = React.useMemo<Crumb[]>(() => {
    const parts = pathname.split("/").filter(Boolean)
    const adminIndex = parts.indexOf("admin")
    if (adminIndex === -1) return []
    const rest = parts.slice(adminIndex + 1)

    const trail: Crumb[] = [{ href: "/admin", label: tNav("brand") }]
    let acc = "/admin"

    const sectionKeys = [
      "info",
      "hours",
      "prices",
      "packages",
      "events",
      "menu",
      "reviews",
      "contact",
      "media",
      "footer",
      "legal",
    ] as const
    type SectionKey = (typeof sectionKeys)[number]
    const isSectionKey = (s: string): s is SectionKey =>
      (sectionKeys as readonly string[]).includes(s)

    for (let i = 0; i < rest.length; i++) {
      const segment = rest[i]!
      acc += `/${segment}`
      const isLast = i === rest.length - 1

      if (segment === "branches") continue

      let label = segment
      if (segment === "new") label = tForm("newTitle")
      else if (isSectionKey(segment)) label = tTabs(segment)
      else label = slugLabels[segment] ?? segment

      trail.push({ href: isLast ? null : acc, label })
    }

    return trail
  }, [pathname, slugLabels, tForm, tNav, tTabs])

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1
          return (
            <React.Fragment key={`${crumb.label}-${idx}`}>
              <BreadcrumbItem>
                {isLast || crumb.href === null ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={crumb.href}>{crumb.label}</Link>}
                  />
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
