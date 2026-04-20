import { getLocale, getTranslations } from "next-intl/server"
import { IconBrandWhatsapp } from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { PackageCard } from "@/components/common/package-card"

export async function EventsTeaser({ branch }: { branch: Branch }) {
  const t = await getTranslations("EventsTeaser")
  const wa = await getTranslations("WhatsApp")
  const cta = await getTranslations("Cta")
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const featured = branch.packages[0]
  const branchName = branch.displayName[locale]
  const message = featured
    ? `${wa("prefilled", { branch: branchName })} (${featured.title[locale]} – ${featured.price})`
    : wa("prefilled", { branch: branchName })
  const waHref = buildWhatsAppLink(branch, message)

  return (
    <section className="bg-surface-deep text-paper">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
          <div className="text-paper">
            <span className="inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-paper/60">
              {t("title")}
            </span>
            <h2 className="mt-3 font-heading text-4xl text-paper sm:text-5xl">
              {t("subtitle")}
            </h2>
            <a
              href={waHref}
              target="_blank"
              rel="noopener"
              className="mt-7 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-whatsapp px-6 text-base font-medium text-white shadow-soft transition hover:bg-whatsapp-hover hover:shadow-card"
            >
              <IconBrandWhatsapp className="size-5" aria-hidden />
              {cta("book")}
            </a>
          </div>

          {featured && <PackageCard branch={branch} pkg={featured} withCta={false} />}
        </div>
      </div>
    </section>
  )
}
