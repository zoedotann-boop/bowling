import { getLocale, getTranslations } from "next-intl/server"
import type { Branch } from "@/lib/branches"
import { Eyebrow } from "@/components/common/eyebrow"

export async function MenuSection({ branch }: { branch: Branch }) {
  const t = await getTranslations("Menu")
  const locale = (await getLocale()) as keyof Branch["displayName"]

  return (
    <section className="bg-surface-cool">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-3 font-heading text-4xl text-ink sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-ink-soft sm:text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {branch.menu.map((cat, i) => (
            <div
              key={i}
              className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-7"
            >
              <h3 className="font-heading text-2xl text-ink">{cat.title[locale]}</h3>
              <ul className="mt-5 divide-y divide-line">
                {cat.items.map((item, j) => (
                  <li key={j} className="flex items-start justify-between gap-4 py-3.5">
                    <div className="min-w-0">
                      <span className="block text-sm font-medium text-ink">
                        {item.name[locale]}
                      </span>
                      {item.tag && (
                        <span className="mt-1 inline-block rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                          {item.tag[locale]}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-sm font-medium text-ink">
                      {item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
