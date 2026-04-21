import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { IconBrandWhatsapp, IconClock, IconMapPin } from "@tabler/icons-react"
import type { SiteBranch } from "@/lib/site-branch"
import { BowlingLogo } from "@/components/brand/bowling-logo"
import { BowlingCard } from "@/components/brand/bowling-card"
import { RetroButton } from "@/components/brand/retro-button"
import { Ball, Burst, Pin } from "@/components/brand/glyphs"
import { Eyebrow } from "@/components/common/eyebrow"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { getTodayHours } from "@/lib/hours"

export async function Hero({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations()
  const wa = await getTranslations("WhatsApp")
  const message = wa("prefilled", { branch: branch.displayName })
  const waHref = buildWhatsAppLink(branch, message)
  const tel = branch.phone.replace(/[^\d+]/g, "")
  const today = getTodayHours(branch)

  return (
    <section className="relative overflow-hidden bg-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute -end-5 top-2 opacity-90"
      >
        <Burst color="var(--yellow)" size={140} />
      </div>
      <div aria-hidden className="pointer-events-none absolute end-8 top-6">
        <Ball color="var(--turq)" size={56} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -start-2 top-44 rotate-12"
      >
        <Pin color="#fff" stripe="var(--red)" size={44} />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pt-10 pb-12 sm:px-6 sm:pt-16 sm:pb-20">
        <div className="flex justify-center pt-4 pb-8">
          <BowlingLogo city={branch.city} size="md" />
        </div>

        <BowlingCard
          surface="paper"
          ring="red"
          shadow="lg"
          contentClassName="px-5 py-6 text-center"
        >
          <Eyebrow tone="red">{t("Hero.scrollHint")}</Eyebrow>
          <h1 className="mt-3 font-display text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.02] text-ink">
            {branch.hero.headline}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink/80">
            {branch.hero.tagline}
          </p>
        </BowlingCard>

        <div className="mt-5 flex flex-col gap-3">
          <RetroButton
            tone="red"
            size="lg"
            full
            render={
              <a href={waHref} target="_blank" rel="noopener">
                <IconBrandWhatsapp aria-hidden />
                {t("Cta.book")}
              </a>
            }
          />
          <RetroButton
            tone="turq"
            full
            render={<Link href="#prices">{t("Cta.viewPrices")}</Link>}
          />
          <RetroButton
            tone="yellow"
            full
            render={<a href={`tel:${tel}`}>{t("Cta.callNow")}</a>}
          />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <InfoTile
            icon={<IconClock className="size-4" aria-hidden />}
            label={t("Hero.openNow")}
            value={
              today.isClosed
                ? t("Hero.closedNow")
                : `${today.open} – ${today.close}`
            }
          />
          <InfoTile
            icon={<IconMapPin className="size-4" aria-hidden />}
            label={t("Contact.address")}
            value={branch.address}
            href={branch.mapUrl}
            external
          />
          <InfoTile
            icon={<IconBrandWhatsapp className="size-4" aria-hidden />}
            label={t("Contact.phone")}
            value={branch.phone}
            href={`tel:${tel}`}
          />
        </div>
      </div>
    </section>
  )
}

function InfoTile({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
  external?: boolean
}) {
  const inner = (
    <div className="flex h-full items-center gap-3 border-2 border-ink bg-paper px-3 py-2.5 text-start shadow-block-sm">
      <span className="grid size-9 shrink-0 place-items-center border-2 border-ink bg-yellow text-ink">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] font-bold tracking-[0.18em] text-red uppercase">
          {label}
        </div>
        <div className="truncate text-sm font-bold text-ink">{value}</div>
      </div>
    </div>
  )
  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener" : undefined}
      >
        {inner}
      </a>
    )
  }
  return inner
}
