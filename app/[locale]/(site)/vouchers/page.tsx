import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { hasLocale } from "next-intl"
import { routing, type Locale } from "@/i18n/routing"
import { loadSiteBranch } from "@/lib/site-branch"
import { PageBack } from "@/components/sections/page-back"
import { VouchersForm } from "@/components/sections/vouchers-form"
import { Eyebrow } from "@/components/common/eyebrow"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "Vouchers" })
  return { title: t("title") }
}

export default async function VouchersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const branch = await loadSiteBranch(locale)
  if (!branch) notFound()

  const t = await getTranslations("Vouchers")

  return (
    <>
      <PageBack />
      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 pt-6 pb-10 sm:px-6 sm:pt-8">
          <span className="inline-flex items-center rounded-md border-2 border-ink bg-ink px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.22em] text-yellow uppercase">
            BUYME
          </span>
          <div className="mt-4">
            <Eyebrow tone="red">{t("eyebrow")}</Eyebrow>
            <h1 className="mt-2 font-display text-4xl leading-[1.05] text-ink sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-ink/80">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>
      <VouchersForm />
    </>
  )
}
