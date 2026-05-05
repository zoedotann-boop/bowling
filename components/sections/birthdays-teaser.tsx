import { getTranslations } from "next-intl/server"
import { IconArrowLeft } from "@tabler/icons-react"
import { Link } from "@/i18n/navigation"
import { BowlingCard } from "@/components/brand/bowling-card"
import { RetroButton } from "@/components/brand/retro-button"
import { Eyebrow } from "@/components/common/eyebrow"

export async function BirthdaysTeaser() {
  const t = await getTranslations("BirthdaysTeaser")

  return (
    <section className="bg-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <BowlingCard
          surface="ink"
          ring="yellow"
          shadow="lg"
          contentClassName="px-5 py-7 text-center sm:px-8 sm:py-10"
        >
          <Eyebrow tone="yellow">{t("eyebrow")}</Eyebrow>
          <h2 className="mt-3 font-display text-3xl leading-[1.05] text-cream sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-cream/80 sm:text-base">
            {t("subtitle")}
          </p>
          <div className="mt-6 flex justify-center">
            <RetroButton
              tone="yellow"
              size="lg"
              render={
                <Link href="/birthdays">
                  {t("cta")}
                  <IconArrowLeft className="rtl:-scale-x-100" aria-hidden />
                </Link>
              }
            />
          </div>
        </BowlingCard>
      </div>
    </section>
  )
}
