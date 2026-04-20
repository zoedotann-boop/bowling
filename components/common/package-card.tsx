import { getLocale, getTranslations } from "next-intl/server"
import { IconBrandWhatsapp } from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"
import { buildWhatsAppLink } from "@/lib/whatsapp"

type Pkg = Branch["packages"][number]

export async function PackageCard({
  branch,
  pkg,
  withCta = true,
}: {
  branch: Branch
  pkg: Pkg
  withCta?: boolean
}) {
  const wa = await getTranslations("WhatsApp")
  const cta = await getTranslations("Cta")
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const message = `${wa("prefilled", { branch: branch.displayName[locale] })} (${pkg.title[locale]} – ${pkg.price})`
  const waHref = buildWhatsAppLink(branch, message)

  return (
    <div className="flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-heading text-2xl text-ink">{pkg.title[locale]}</h3>
        <span className="font-mono text-2xl font-medium text-ink">{pkg.price}</span>
      </div>
      <div className="mt-5 h-px bg-line" />
      <p className="mt-5 flex-1 text-sm leading-relaxed text-ink-soft">
        {pkg.perks[locale]}
      </p>
      {withCta && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener"
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp text-sm font-medium text-white shadow-soft transition hover:bg-whatsapp-hover"
        >
          <IconBrandWhatsapp className="size-5" aria-hidden />
          {cta("book")}
        </a>
      )}
    </div>
  )
}
