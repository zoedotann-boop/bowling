import { getTranslations } from "next-intl/server"
import { IconCamera } from "@tabler/icons-react"
import type { SiteBranch } from "@/lib/site-branch"
import { Eyebrow } from "@/components/common/eyebrow"

export async function SiteGallery({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations("Gallery")
  const heroImage = branch.hero.image
  const tiles = Array.from({ length: 9 }, (_, i) =>
    i === 0 ? heroImage : null
  )

  return (
    <section className="bg-cream-2">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow tone="red">{t("title")}</Eyebrow>
            <h2 className="mt-2 font-display text-2xl leading-[1] text-ink sm:text-3xl">
              {t("subtitle")}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {tiles.map((src, i) => (
            <div
              key={i}
              className={`relative grid place-items-center overflow-hidden border-2 border-ink bg-paper shadow-block-sm ${
                i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"
              }`}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex flex-col items-center gap-1 text-ink/40">
                  <IconCamera className="size-5" aria-hidden />
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
                    {t("placeholder")}
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
