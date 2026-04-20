import { getTranslations } from "next-intl/server"
import type { Branch } from "@/lib/branches"
import { Link } from "@/i18n/navigation"
import { SectionHeader } from "@/components/common/section-header"
import { ContactInfoCard } from "@/components/common/contact-info-card"
import { HoursCard } from "@/components/common/hours-card"

export async function ContactBlock({ branch }: { branch: Branch }) {
  const t = await getTranslations()

  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto mb-12 sm:mb-16">
          <SectionHeader
            eyebrow={t("Contact.title")}
            title={t("Contact.title")}
            subtitle={t("Contact.intro")}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ContactInfoCard branch={branch} />
          <HoursCard branch={branch} />
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 text-sm font-medium text-ink shadow-soft transition hover:bg-surface-muted"
          >
            {t("Cta.contact")}
          </Link>
        </div>
      </div>
    </section>
  )
}
