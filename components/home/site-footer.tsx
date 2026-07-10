"use client"

import Image from "next/image"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

import { useBranch } from "@/components/branch-context"
import { Container } from "./container"

const SOCIALS = [
  { glyph: "f", label: "Facebook", bg: "bg-[#4973c3]" },
  { glyph: "◎", label: "Instagram", bg: "bg-[#dcb677]" },
  { glyph: "♪", label: "TikTok", bg: "bg-[#9101ca]" },
]

const FOOTER_NAV_HREFS = ["/", "/menu", "/events", "/gift-card", "/contact"]

function FooterColumn({
  title,
  items,
  hrefs,
}: {
  title: string
  items: string[]
  hrefs?: string[]
}) {
  return (
    <>
      <div className="mb-3 font-heading text-[15px] font-extrabold text-secondary lg:mb-3.5 lg:text-base">
        {title}
      </div>
      <div className="flex flex-col gap-2.5 text-sm font-semibold text-mud lg:text-[15px]">
        {items.map((l, i) =>
          hrefs ? (
            <Link
              key={l}
              href={hrefs[i]}
              className="w-fit transition-colors hover:text-secondary"
            >
              {l}
            </Link>
          ) : (
            <span key={l}>{l}</span>
          )
        )}
      </div>
    </>
  )
}

export function SiteFooter() {
  const t = useTranslations()
  const { branch } = useBranch()
  const locale = useLocale() as "he" | "en"
  const navLinks = t.raw("footer.navLinks") as string[]
  const branchDetails = [
    branch.addressLine1[locale],
    branch.addressLine2[locale],
    branch.phone,
    "info@bowling.co.il",
  ]
  const hours = t.raw("footer.hours") as string[]

  return (
    <footer className="border-t border-navy bg-cream-warm pt-7 pb-5 lg:pt-13 lg:pb-7">
      <Container>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Image
              src={branch.logo.src}
              alt={t("brand")}
              width={branch.logo.width}
              height={branch.logo.height}
              className="mb-3 h-12 w-auto lg:h-14"
            />
            <p className="mb-3.5 max-w-[320px] text-sm leading-[1.55] font-medium text-mud lg:mb-4 lg:text-[15px]">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ glyph, label, bg }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`flex size-10 items-center justify-center rounded-sm border border-navy text-lg font-black text-foreground lg:size-[42px] ${bg}`}
                >
                  {glyph}
                </a>
              ))}
            </div>
          </div>

          <div>
            <FooterColumn
              title={t("footer.navTitle")}
              items={navLinks}
              hrefs={FOOTER_NAV_HREFS}
            />
          </div>
          <div>
            <FooterColumn title={branch.name[locale]} items={branchDetails} />
          </div>
          <div className="col-span-2 lg:col-span-1">
            <FooterColumn title={t("footer.hoursTitle")} items={hours} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 border-t border-border pt-[18px] text-center text-[12.5px] font-medium lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:pt-5 lg:text-[13px]">
          <span className="text-mud">{t("footer.copyright")}</span>
          <div className="flex flex-col items-center gap-1.5 lg:flex-row lg:gap-4">
            <span className="text-mud">
              {t("footer.creditPrefix")}{" "}
              <a
                href="https://zoedotan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-navy underline transition-colors hover:text-secondary"
              >
                {t("footer.creditName")}
              </a>
            </span>
            <Link
              href="/accessibility"
              className="text-navy underline transition-colors hover:text-secondary"
            >
              {t("footer.accessibility")}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
