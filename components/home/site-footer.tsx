import Link from "next/link"
import { useTranslations } from "next-intl"

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
      <div className="mb-3 font-heading text-[15px] font-extrabold text-teal lg:mb-3.5 lg:text-base">
        {title}
      </div>
      <div className="flex flex-col gap-2.5 text-sm font-semibold text-cream-warm lg:text-[15px]">
        {items.map((l, i) =>
          hrefs ? (
            <Link
              key={l}
              href={hrefs[i]}
              className="w-fit transition-colors hover:text-paper"
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
  const navLinks = t.raw("footer.navLinks") as string[]
  const branchDetails = t.raw("footer.branchDetails") as string[]
  const hours = t.raw("footer.hours") as string[]

  return (
    <footer className="bg-gold pt-7 pb-5 lg:pt-13 lg:pb-7">
      <Container>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-[11px] border-[3px] border-paper bg-red text-lg lg:size-10 lg:text-xl">
                🎳
              </span>
              <span className="font-heading text-2xl font-black tracking-[-1px] text-paper lg:text-[26px]">
                {t("brand")}
                <span className="text-red">.</span>
              </span>
            </div>
            <p className="mb-3.5 max-w-[320px] text-sm leading-[1.55] font-medium text-teal lg:mb-4 lg:text-[15px]">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ glyph, label, bg }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`flex size-10 items-center justify-center rounded-xl border-[3px] border-paper text-lg font-black text-paper lg:size-[42px] ${bg}`}
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
            <FooterColumn title={t("footer.branchTitle")} items={branchDetails} />
          </div>
          <div className="col-span-2 lg:col-span-1">
            <FooterColumn title={t("footer.hoursTitle")} items={hours} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-1.5 border-t-2 border-navy/20 pt-[18px] text-center text-[12.5px] font-medium lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:pt-5 lg:text-[13px]">
          <span className="text-cream-warm">{t("footer.copyright")}</span>
          <span className="cursor-pointer text-navy underline">
            {t("footer.accessibility")}
          </span>
        </div>
      </Container>
    </footer>
  )
}
