import { getTranslations, setRequestLocale } from "next-intl/server"
import type { Locale } from "@/i18n/routing"
import type { Branch } from "@/lib/branches"
import { getCurrentBranch } from "@/lib/branch-context"
import { Eyebrow } from "@/components/common/eyebrow"
import { PackageCard } from "@/components/common/package-card"

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const branch = await getCurrentBranch()
  const t = await getTranslations("Events")
  const l = locale as keyof Branch["displayName"]

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow>{branch.displayName[l]}</Eyebrow>
        <h1 className="mt-3 font-heading text-5xl text-ink sm:text-6xl">{t("title")}</h1>
        <p className="mt-4 text-base text-ink-soft sm:text-lg">{t("intro")}</p>
      </header>

      <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-3">
        {branch.events.map((e, i) => (
          <article
            key={i}
            className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8"
          >
            <h3 className="font-heading text-2xl text-ink">{e.title[l]}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{e.description[l]}</p>
          </article>
        ))}
      </div>

      <h2 className="mt-20 text-center font-heading text-3xl text-ink sm:text-4xl">
        {t("inquireCta")}
      </h2>
      <div className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-2">
        {branch.packages.map((p, i) => (
          <PackageCard key={i} branch={branch} pkg={p} />
        ))}
      </div>
    </div>
  )
}
