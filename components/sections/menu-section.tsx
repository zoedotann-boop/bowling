import { getLocale, getTranslations } from "next-intl/server"
import type { Branch } from "@/lib/branches"
import { BowlingCard } from "@/components/brand/bowling-card"
import { Eyebrow } from "@/components/common/eyebrow"

export async function MenuSection({ branch }: { branch: Branch }) {
  const t = await getTranslations("Menu")
  const locale = (await getLocale()) as keyof Branch["displayName"]

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <Eyebrow tone="red">{t("eyebrow")}</Eyebrow>
          <h2 className="mt-2 font-display text-3xl leading-[1] text-ink sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-base text-ink/70">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {branch.menu.map((cat, i) => (
            <BowlingCard
              key={i}
              surface="paper"
              ring="turq"
              shadow="md"
              contentClassName="px-4 py-5 sm:px-5"
            >
              <div className="mb-3 text-center">
                <div className="font-display text-xl tracking-[0.08em] text-red uppercase">
                  {cat.title[locale]}
                </div>
              </div>
              <ul>
                {cat.items.map((item, j) => (
                  <li
                    key={j}
                    className={`py-2.5 ${
                      j < cat.items.length - 1
                        ? "border-b border-dotted border-ink/30"
                        : ""
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-[15px] font-extrabold text-ink">
                        {item.name[locale]}
                      </span>
                      <span className="relative -top-0.5 flex-1 border-b border-dotted border-ink/40" />
                      <span className="font-display text-base text-red">
                        {item.price}
                      </span>
                    </div>
                    {item.tag && (
                      <div className="mt-1 text-xs text-ink/70">
                        {item.tag[locale]}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </BowlingCard>
          ))}
        </div>
      </div>
    </section>
  )
}
