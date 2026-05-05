import { getTranslations } from "next-intl/server"
import {
  IconBrandWaze,
  IconBrandWhatsapp,
  IconCamera,
} from "@tabler/icons-react"
import type { SiteBranch } from "@/lib/site-branch"
import { RetroButton } from "@/components/brand/retro-button"
import { Eyebrow } from "@/components/common/eyebrow"
import { buildWhatsAppLink } from "@/lib/whatsapp"

export async function Hero({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations()
  const wa = await getTranslations("WhatsApp")
  const message = wa("prefilled", { branch: branch.displayName })
  const waHref = buildWhatsAppLink(branch, message)

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14">
        <HeroPhoto src={branch.hero.image} />

        <Eyebrow tone="red" className="mt-6">
          {branch.city}
        </Eyebrow>
        <h1 className="mt-2 font-display text-[clamp(2rem,7vw,3.25rem)] leading-[1.05] text-ink">
          {branch.hero.headline}
        </h1>
        <p className="mt-3 max-w-prose text-base leading-relaxed text-ink/80">
          {branch.hero.tagline}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <RetroButton
            tone="ink"
            size="lg"
            full
            render={
              <a href={branch.mapUrl} target="_blank" rel="noopener">
                <IconBrandWaze aria-hidden />
                {t("Cta.getDirections")}
              </a>
            }
          />
          <RetroButton
            tone="outline"
            size="lg"
            full
            render={
              <a href={waHref} target="_blank" rel="noopener">
                <IconBrandWhatsapp aria-hidden />
                {t("Cta.book")}
              </a>
            }
          />
        </div>
      </div>
    </section>
  )
}

function HeroPhoto({ src }: { src: string | null }) {
  if (src) {
    return (
      <div className="aspect-[16/10] overflow-hidden border-2 border-ink shadow-block-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          loading="eager"
        />
      </div>
    )
  }
  return (
    <div className="grid aspect-[16/10] place-items-center border-2 border-dashed border-ink/30 bg-paper text-ink/40">
      <IconCamera className="size-8" aria-hidden />
    </div>
  )
}
