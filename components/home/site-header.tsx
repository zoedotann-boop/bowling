"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { whatsappUrl } from "@/lib/contact"
import { useBranch } from "@/components/branch-context"
import { Container } from "./container"
import { LangToggle } from "./lang-toggle"
import { BranchSwitcher } from "./branch-switcher"

const NAV_HREFS = ["/", "/menu", "/events"]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations()
  const { branch } = useBranch()
  const navItems = t.raw("header.nav") as string[]

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  // Lock body scroll while the off-canvas menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header>
      <div className="border-b-[4px] border-navy bg-cream-warm">
        <Container className="flex items-center justify-between gap-4 py-3 lg:py-3.5">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={branch.logo.src}
              alt={t("brand")}
              width={branch.logo.width}
              height={branch.logo.height}
              priority
              className="h-11 w-auto lg:h-14"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 rounded-full border-[3px] border-dotted border-navy bg-cream-warm p-[5px] lg:flex">
            {navItems.map((label, i) => (
              <Link
                key={label}
                href={NAV_HREFS[i]}
                className={cn(
                  "rounded-full px-[18px] py-2 font-heading text-sm font-extrabold transition-colors",
                  isActive(NAV_HREFS[i])
                    ? "bg-navy text-paper"
                    : "text-navy hover:bg-cream"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <BranchSwitcher />
            <LangToggle />
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-[3px] border-navy bg-rust px-5 py-2.5 font-heading text-sm font-extrabold text-paper transition-colors hover:bg-red"
            >
              {t("header.whatsapp")}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("header.openMenu")}
            aria-expanded={open}
            className="flex size-11 flex-col items-center justify-center gap-1 rounded-xl border-[3px] border-navy bg-paper lg:hidden"
          >
            <span className="h-[2.5px] w-5 rounded bg-navy" />
            <span className="h-[2.5px] w-5 rounded bg-navy" />
            <span className="h-[2.5px] w-5 rounded bg-navy" />
          </button>
        </Container>
      </div>

      {/* Mobile off-canvas menu (slides in from the side) */}
      <div
        className={cn(
          "fixed inset-0 z-[70] lg:hidden",
          open ? "" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        {/* Overlay */}
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label={t("header.openMenu")}
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-navy/50 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Panel */}
        <div
          className={cn(
            "absolute inset-y-0 end-0 flex w-[82%] max-w-xs flex-col overflow-y-auto border-s-[4px] border-dotted border-navy bg-[#faf0e3] px-5 pt-5 pb-8 shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
          )}
        >
          <div className="mb-5 flex items-center justify-between">
            <Image
              src={branch.logo.src}
              alt={t("brand")}
              width={branch.logo.width}
              height={branch.logo.height}
              className="h-10 w-auto"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex size-10 items-center justify-center rounded-xl border-[3px] border-navy bg-paper"
            >
              <X className="size-5 text-navy" strokeWidth={3} />
            </button>
          </div>

          <nav className="flex flex-col gap-2.5">
            {navItems.map((label, i) => (
              <Link
                key={label}
                href={NAV_HREFS[i]}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl border-[3px] border-dotted px-4 py-3 font-heading text-base font-extrabold transition-colors",
                  isActive(NAV_HREFS[i])
                    ? "border-navy bg-navy text-paper"
                    : "border-navy/40 text-navy hover:bg-cream-warm"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex gap-2.5">
            <BranchSwitcher className="flex-1 py-[11px]" />
            <LangToggle className="px-4 py-[11px]" />
          </div>

          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 rounded-full border-[3px] border-navy bg-rust px-5 py-3 text-center font-heading text-sm font-extrabold text-paper transition-colors hover:bg-red"
          >
            {t("header.whatsapp")}
          </a>
        </div>
      </div>
    </header>
  )
}
