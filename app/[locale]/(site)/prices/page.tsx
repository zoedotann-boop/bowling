import { getTranslations, setRequestLocale } from "next-intl/server"
import type { Locale } from "@/i18n/routing"
import { getCurrentBranch } from "@/lib/branch-context"
import type { Branch } from "@/lib/branches"
import { Eyebrow } from "@/components/common/eyebrow"
import { PricingTable } from "@/components/common/pricing-table"
import { PackageCard } from "@/components/common/package-card"

export default async function PricesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const branch = await getCurrentBranch()
  const t = await getTranslations("Pricing")
  const l = locale as keyof Branch["displayName"]

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow>{branch.displayName[l]}</Eyebrow>
        <h1 className="font-heading mt-3 text-5xl text-ink sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-base text-ink-soft sm:text-lg">{t("intro")}</p>
      </header>

      <div className="mt-12 sm:mt-16">
        <PricingTable branch={branch} />
      </div>

      <h2 className="font-heading mt-20 text-center text-3xl text-ink sm:text-4xl">
        {t("packagesTitle")}
      </h2>
      <div className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-2">
        {branch.packages.map((p, i) => (
          <PackageCard key={i} branch={branch} pkg={p} withCta={false} />
        ))}
      </div>
    </div>
  )
}
