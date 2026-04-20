import { getLocale, getTranslations } from "next-intl/server"
import {
  IconBrandWhatsapp,
  IconClock,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"
import { BowlingLogo } from "@/components/brand/bowling-logo"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { getTodayHours, isOpenNow } from "@/lib/hours"

export async function Hero({ branch }: { branch: Branch }) {
  const t = await getTranslations()
  const wa = await getTranslations("WhatsApp")
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const message = wa("prefilled", { branch: branch.displayName[locale] })
  const waHref = buildWhatsAppLink(branch, message)
  const tel = branch.phone.replace(/[^\d+]/g, "")
  const today = getTodayHours(branch)
  const open = isOpenNow(branch)
  const city = branch.city[locale]

  return (
    <section className="relative overflow-hidden bg-surface-warm">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:px-8 lg:pt-28 lg:pb-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft shadow-soft">
            <span
              className={`size-1.5 rounded-full ${open ? "bg-whatsapp" : "bg-ticket-red"}`}
              aria-hidden
            />
            <span>{open ? t("Hero.openNow") : t("Hero.closedNow")}</span>
            <span className="text-ink-muted">·</span>
            <span className="font-mono text-ink">
              {today.open} – {today.close}
            </span>
          </div>

          <BowlingLogo city={city} size="md" className="mb-8" />

          <h1 className="font-heading text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.05] text-ink">
            {branch.hero.headline[locale]}
          </h1>

          <p className="mt-5 max-w-xl text-base text-pretty text-ink-soft sm:text-lg sm:leading-relaxed">
            {branch.hero.tagline[locale]}
          </p>

          <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <a
              href={waHref}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-7 text-base font-medium text-white shadow-soft transition hover:scale-[1.02] hover:bg-whatsapp-hover hover:shadow-card"
            >
              <IconBrandWhatsapp className="size-5" aria-hidden />
              {t("Cta.book")}
            </a>
            <a
              href={`tel:${tel}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 text-base font-medium text-ink shadow-soft transition hover:bg-surface-muted"
            >
              <IconPhone className="size-5 text-ink-muted" aria-hidden />
              {t("Cta.callNow")}
            </a>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-3 sm:mt-20 sm:grid-cols-3 sm:gap-4">
          <InfoTile
            icon={<IconClock className="size-4" aria-hidden />}
            label={t("Hero.openNow")}
            value={`${today.open} – ${today.close}`}
            tone={open ? "ok" : "muted"}
          />
          <InfoTile
            icon={<IconMapPin className="size-4" aria-hidden />}
            label={t("Contact.address")}
            value={branch.address[locale]}
            href={branch.mapUrl}
            external
          />
          <InfoTile
            icon={<IconPhone className="size-4" aria-hidden />}
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
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
  external?: boolean
  tone?: "ok" | "muted"
}) {
  const inner = (
    <div className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-start transition hover:border-ink/15 hover:shadow-soft">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl ${
          tone === "ok"
            ? "bg-whatsapp/10 text-whatsapp"
            : "bg-surface-muted text-ink-muted"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium tracking-[0.14em] text-ink-muted uppercase">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-ink">{value}</div>
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
