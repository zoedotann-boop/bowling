import { getTranslations, setRequestLocale } from "next-intl/server"
import type { Locale } from "@/i18n/routing"
import type { Branch } from "@/lib/branches"
import { getCurrentBranch } from "@/lib/branch-context"
import { ContactForm } from "@/components/forms/contact-form"
import { ContactInfoCard } from "@/components/common/contact-info-card"
import { HoursCard } from "@/components/common/hours-card"
import { Eyebrow } from "@/components/common/eyebrow"

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const branch = await getCurrentBranch()
  const t = await getTranslations()
  const l = locale as keyof Branch["displayName"]

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow>{branch.displayName[l]}</Eyebrow>
        <h1 className="mt-3 font-heading text-5xl text-ink sm:text-6xl">{t("Contact.title")}</h1>
        <p className="mt-4 text-base text-ink-soft sm:text-lg">{t("Contact.intro")}</p>
      </header>

      <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-10">
          <ContactForm defaultBranchSlug={branch.slug} />
        </div>

        <div className="space-y-5">
          <ContactInfoCard branch={branch} />
          <HoursCard branch={branch} />
        </div>
      </div>
    </div>
  )
}
