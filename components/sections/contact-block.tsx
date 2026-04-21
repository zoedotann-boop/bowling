import { getTranslations } from "next-intl/server"
import { IconMapPin, IconPhone } from "@tabler/icons-react"
import type { SiteBranch } from "@/lib/site-branch"
import { BowlingCard } from "@/components/brand/bowling-card"
import { RetroButton } from "@/components/brand/retro-button"
import { Eyebrow } from "@/components/common/eyebrow"

export async function ContactBlock({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations()
  const tContact = await getTranslations("Contact")
  const tHero = await getTranslations("Hero")
  const tel = branch.phone.replace(/[^\d+]/g, "")

  return (
    <section
      id="contact"
      className="relative scroll-mt-24 border-t-[3px] border-ink bg-yellow"
    >
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6">
          <Eyebrow tone="ink">{tContact("title")}</Eyebrow>
          <h2 className="mt-2 font-display text-3xl leading-[0.98] text-ink sm:text-4xl">
            {branch.address}, <span className="text-red">{branch.city}.</span>
          </h2>
        </div>

        <BowlingCard
          surface="cream"
          ring="ink"
          shadow="md"
          contentClassName="px-4 py-3 sm:px-5"
        >
          {branch.hours.map((h, i) => (
            <div
              key={i}
              className={`flex items-baseline justify-between gap-3 py-2 ${
                i < branch.hours.length - 1
                  ? "border-b border-dotted border-ink/30"
                  : ""
              }`}
            >
              <span className="text-[15px] font-extrabold text-ink">
                {h.day}
              </span>
              <span
                className="font-mono text-sm tracking-wide text-ink/80"
                dir="ltr"
              >
                {h.isClosed ? tHero("closedNow") : `${h.open} – ${h.close}`}
              </span>
            </div>
          ))}
        </BowlingCard>

        <div className="mt-5 flex flex-col gap-3">
          <RetroButton
            tone="ink"
            full
            render={
              <a href={branch.mapUrl} target="_blank" rel="noopener">
                <IconMapPin aria-hidden />
                {t("Cta.getDirections")}
              </a>
            }
          />
          <RetroButton
            tone="turq"
            full
            render={
              <a href={`tel:${tel}`}>
                <IconPhone aria-hidden />
                {t("Cta.callNow")}
              </a>
            }
          />
        </div>
      </div>
    </section>
  )
}
