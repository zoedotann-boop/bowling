import { getLocale, getTranslations } from "next-intl/server"
import { IconBrandWhatsapp } from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { BowlingCard } from "@/components/brand/bowling-card"
import { RetroButton } from "@/components/brand/retro-button"
import { Eyebrow } from "@/components/common/eyebrow"

export async function EventsTeaser({ branch }: { branch: Branch }) {
  const t = await getTranslations("EventsTeaser")
  const wa = await getTranslations("WhatsApp")
  const cta = await getTranslations("Cta")
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const featured = branch.packages[0]
  const rest = branch.packages.slice(1)
  const branchName = branch.displayName[locale]
  const message = featured
    ? `${wa("prefilled", { branch: branchName })} (${featured.title[locale]} – ${featured.price})`
    : wa("prefilled", { branch: branchName })
  const waHref = buildWhatsAppLink(branch, message)

  return (
    <section id="events" className="scroll-mt-24 bg-ink">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8">
          <Eyebrow tone="yellow">{t("title")}</Eyebrow>
          <h2 className="mt-2 font-display text-3xl leading-[1] text-cream sm:text-4xl">
            {t("subtitle")}
          </h2>
        </div>

        {featured && (
          <BowlingCard
            surface="red"
            ring="yellow"
            shadow="lg"
            contentClassName="px-5 py-6 text-center"
          >
            <div className="font-mono text-[11px] font-bold tracking-[0.22em] text-yellow uppercase">
              ★ {cta("exploreEvents")} ★
            </div>
            <h3 className="mt-3 font-display text-3xl leading-[1] text-white">
              {featured.title[locale]}
            </h3>
            <div className="mt-2 font-display text-2xl text-yellow">
              {featured.price}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              {featured.perks[locale]}
            </p>
            <div className="mt-5 flex justify-center">
              <RetroButton
                tone="yellow"
                size="lg"
                render={
                  <a href={waHref} target="_blank" rel="noopener">
                    <IconBrandWhatsapp aria-hidden />
                    {cta("book")}
                  </a>
                }
              />
            </div>
          </BowlingCard>
        )}

        {rest.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {rest.map((pkg, i) => (
              <BowlingCard
                key={i}
                surface="cream"
                ring="ink"
                shadow="md"
                contentClassName="px-4 py-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="font-display text-xl text-ink">
                    {pkg.title[locale]}
                  </h4>
                  <span className="font-display text-xl text-red">
                    {pkg.price}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  {pkg.perks[locale]}
                </p>
              </BowlingCard>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
