"use client"

import Image from "next/image"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

import { pickLocale } from "@/lib/localized"
import { useBranch } from "@/components/branch-context"
import { useSiteContent } from "@/components/site-content-context"
import { Container } from "./container"
import { LangToggle } from "./lang-toggle"

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
  const content = useSiteContent()
  const navLinks = t.raw("footer.navLinks") as string[]
  const email = content?.email?.trim() || "info@bowling.co.il"
  const branchDetails = [
    branch.addressLine1[locale],
    branch.addressLine2[locale],
    branch.phone,
    email,
  ]
  const hours = t.raw("footer.hours") as string[]
  const tagline =
    pickLocale(content?.site?.footerNote, locale) || t("footer.tagline")

  return (
    <footer className="border-t border-navy bg-cream-warm pt-7 pb-5 lg:pt-13 lg:pb-7">
      <Container>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Image
              src={branch.logo.src}
              alt={t("brand")}
              width={branch.logo.width}
              height={branch.logo.height}
              className="mb-3 h-12 w-auto lg:h-14"
            />
            <p className="max-w-[320px] text-sm leading-[1.55] font-medium text-mud lg:text-[15px]">
              {tagline}
            </p>
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
            <LangToggle className="mt-1.5 lg:mt-0" />
          </div>
        </div>
      </Container>
    </footer>
  )
}
