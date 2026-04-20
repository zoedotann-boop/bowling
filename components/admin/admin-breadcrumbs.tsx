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
  const tList = useTranslations("Admin.branches.list")
  const tForm = useTranslations("Admin.branches.form")
  const tMedia = useTranslations("Admin.media")

  const crumbs = React.useMemo<Crumb[]>(() => {
    const parts = pathname.split("/").filter(Boolean)
    const adminIndex = parts.indexOf("admin")
    if (adminIndex === -1) return []
    const rest = parts.slice(adminIndex + 1)

    const trail: Crumb[] = [{ href: "/admin", label: tNav("brand") }]
    let acc = "/admin"

    for (let i = 0; i < rest.length; i++) {
      const segment = rest[i]!
      acc += `/${segment}`
      const isLast = i === rest.length - 1
      let label = segment

      if (segment === "branches") label = tList("title")
      else if (segment === "media") label = tMedia("title")
      else if (segment === "new") label = tForm("newTitle")
      else label = slugLabels[segment] ?? segment

      trail.push({ href: isLast ? null : acc, label })
    }

    return trail
  }, [pathname, slugLabels, tForm, tList, tMedia, tNav])

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
