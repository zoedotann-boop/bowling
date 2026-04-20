import { getTranslations } from "next-intl/server"
import { IconArrowRight } from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"
import { Link } from "@/i18n/navigation"
import { SectionHeader } from "@/components/common/section-header"
import { PricingTable } from "@/components/common/pricing-table"

export async function PricingPreview({ branch }: { branch: Branch }) {
  const t = await getTranslations("PricingPreview")

  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <SectionHeader
            eyebrow={t("title")}
            title={t("title")}
            subtitle={t("subtitle")}
          />
          <Link
            href="/prices"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink hover:gap-3"
          >
            {t("viewAll")}
            <IconArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>

        <div className="mt-10 sm:mt-12">
          <PricingTable
            branch={branch}
            rows={branch.prices.slice(0, 3)}
            showHeaderLabel={false}
          />
        </div>
      </div>
    </section>
  )
}
