import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { hasLocale } from "next-intl"
import { routing, type Locale } from "@/i18n/routing"
import { loadSiteBranch } from "@/lib/site-branch"
import { PageBack } from "@/components/sections/page-back"
import {
  BirthdaysHero,
  BirthdaysHowItWorks,
  BirthdaysPackageCompare,
  BirthdaysUpgrades,
  BirthdaysDosDonts,
  BirthdaysPolicy,
} from "@/components/sections/birthdays-sections"
import { BirthdaysLeadForm } from "@/components/sections/birthdays-lead-form"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "Birthdays" })
  return { title: t("title") }
}

export default async function BirthdaysPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const branch = await loadSiteBranch(locale)
  if (!branch) notFound()

  return (
    <>
      <PageBack />
      <BirthdaysHero />
      <BirthdaysHowItWorks />
      <BirthdaysPackageCompare packages={branch.packages} />
      <BirthdaysUpgrades />
      <BirthdaysDosDonts />
      <BirthdaysPolicy />
      <BirthdaysLeadForm />
    </>
  )
}
