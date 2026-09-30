"use client"

import Image from "next/image"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

import { branchPath } from "@/lib/branches"
import { formatHours } from "@/lib/hours"
import { LEGAL_PAGE_KINDS } from "@/lib/legal"
import { pickLocale } from "@/lib/localized"
import { isRemoteImage } from "@/lib/utils"
import { useBranch } from "@/components/branch-context"
import { useSiteContent } from "@/components/site-content-context"
import { Container } from "./container"
import { LangToggle } from "./lang-toggle"

const FOOTER_NAV_HREFS = ["/", "/menu", "/events", "/contact"]

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
  const branchDetails = [
    branch.addressLine1[locale],
    branch.addressLine2[locale],
    branch.phone,
    branch.email,
  ]
  const hours = formatHours(
    branch.hours,
    t.raw("footer.days") as string[],
    t("footer.closed")
  )
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
              unoptimized={isRemoteImage(branch.logo.src)}
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
              hrefs={FOOTER_NAV_HREFS.map((href) =>
                branchPath(branch.id, href)
              )}
            />
          </div>
          <div>
            <FooterColumn title={branch.name[locale]} items={branchDetails} />
          </div>
          <div className="col-span-2 lg:col-span-1">
            <FooterColumn title={t("footer.hoursTitle")} items={hours} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border pt-[18px] text-center text-[12.5px] font-medium lg:mt-8 lg:justify-between lg:pt-5 lg:text-[13px]">
          <span className="whitespace-nowrap text-mud">
            {t("footer.copyright", { branch: branch.name[locale] })}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className="whitespace-nowrap text-mud">
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
            <div className="flex items-center gap-4 whitespace-nowrap">
              {LEGAL_PAGE_KINDS.map((kind) => (
                <Link
                  key={kind}
                  href={branchPath(branch.id, `/${kind}`)}
                  className="text-navy underline transition-colors hover:text-secondary"
                >
                  {t(`footer.${kind}`)}
                </Link>
              ))}
              <LangToggle />
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
