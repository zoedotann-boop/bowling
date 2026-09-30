"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn, isRemoteImage } from "@/lib/utils"
import { branchPath } from "@/lib/branches"
import { whatsappUrl } from "@/lib/contact"
import { useBranch } from "@/components/branch-context"
import { Container } from "./container"
import { BranchSwitcher } from "./branch-switcher"

const NAV_PATHS = ["/", "/menu", "/events"]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations()
  const { branch } = useBranch()
  const navItems = t.raw("header.nav") as string[]
  const home = branchPath(branch.id)
  const navHrefs = NAV_PATHS.map((path) => branchPath(branch.id, path))

  const isActive = (href: string) =>
    href === home ? pathname === home : pathname.startsWith(href)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header>
      <div className="border-b border-navy bg-cream-warm">
        <Container className="flex items-center justify-between gap-4 py-3 lg:py-3.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("header.openMenu")}
            aria-expanded={open}
            className="flex size-11 flex-col items-center justify-center gap-1 rounded-sm border border-navy bg-card lg:hidden"
          >
            <span className="h-[2.5px] w-5 rounded bg-navy" />
            <span className="h-[2.5px] w-5 rounded bg-navy" />
            <span className="h-[2.5px] w-5 rounded bg-navy" />
          </button>

          <Link href={home} className="flex items-center">
            <Image
              src={branch.logo.src}
              alt={t("brand")}
              width={branch.logo.width}
              height={branch.logo.height}
              unoptimized={isRemoteImage(branch.logo.src)}
              priority
              className="h-11 w-auto lg:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-1 rounded-sm border border-navy bg-cream-warm p-[5px] lg:flex">
            {navItems.map((label, i) => (
              <Link
                key={label}
                href={navHrefs[i]}
                className={cn(
                  "rounded-sm px-[18px] py-2 font-heading text-sm font-extrabold transition-colors",
                  isActive(navHrefs[i])
                    ? "glow-primary bg-primary text-primary-foreground"
                    : "text-navy hover:bg-card hover:text-secondary"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <BranchSwitcher />
            <a
              href={whatsappUrl(branch.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-primary hover:glow-cyan rounded-sm border border-primary bg-primary px-5 py-2.5 font-heading text-sm font-extrabold text-primary-foreground transition-colors hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              {t("header.whatsapp")}
            </a>
          </div>
        </Container>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[70] lg:hidden",
          open ? "" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label={t("header.closeMenu")}
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-navy-deep/80 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 start-0 flex w-[82%] max-w-xs flex-col overflow-y-auto border-e border-navy bg-[#1a1a1a] px-5 pt-5 pb-8 transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
          )}
        >
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("header.closeMenu")}
              className="flex size-10 items-center justify-center rounded-sm border border-navy bg-card"
            >
              <X className="size-5 text-navy" strokeWidth={3} />
            </button>
            <Image
              src={branch.logo.src}
              alt={t("brand")}
              width={branch.logo.width}
              height={branch.logo.height}
              unoptimized={isRemoteImage(branch.logo.src)}
              className="h-10 w-auto"
            />
          </div>

          <nav className="flex flex-col gap-2.5">
            {navItems.map((label, i) => (
              <Link
                key={label}
                href={navHrefs[i]}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-sm border px-4 py-3 font-heading text-base font-extrabold transition-colors",
                  isActive(navHrefs[i])
                    ? "glow-primary border-primary bg-primary text-primary-foreground"
                    : "border-border text-navy hover:border-secondary hover:text-secondary"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-4">
            <BranchSwitcher className="py-3" />
          </div>

          <a
            href={whatsappUrl(branch.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="glow-primary hover:glow-cyan mt-3 rounded-sm border border-primary bg-primary px-5 py-3 text-center font-heading text-sm font-extrabold text-primary-foreground transition-colors hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
          >
            {t("header.whatsapp")}
          </a>
        </div>
      </div>
    </header>
  )
}
