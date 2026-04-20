import { getLocale, getTranslations } from "next-intl/server"
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconBrandWhatsapp,
} from "@tabler/icons-react"
import { Link } from "@/i18n/navigation"
import { branches, type Branch } from "@/lib/branches"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { BowlingLogo } from "@/components/brand/bowling-logo"

export async function SiteFooter({ branch }: { branch: Branch }) {
  const t = await getTranslations()
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const tel = branch.phone.replace(/[^\d+]/g, "")

  return (
    <footer className="mt-20 border-t border-line bg-surface sm:mt-28">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <Link
              href="/"
              aria-label={`Bowling ${branch.city[locale]}`}
              className="inline-block"
            >
              <BowlingLogo city={branch.city[locale]} size="md" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
              {t("Footer.tagline")}
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-[11px] font-medium tracking-[0.18em] text-ink-muted uppercase">
              {t("Footer.branches")}
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              {branches.map((b) => (
                <li key={b.slug}>
                  <span className="block font-medium text-ink">
                    {b.displayName[locale]}
                  </span>
                  <span className="text-ink-soft">{b.address[locale]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-[11px] font-medium tracking-[0.18em] text-ink-muted uppercase">
              {t("Footer.contact")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-ink-soft">
              <li className="flex items-start gap-3">
                <IconMapPin
                  className="mt-0.5 size-4 shrink-0 text-ink-muted"
                  aria-hidden
                />
                <span>{branch.address[locale]}</span>
              </li>
              <li className="flex items-center gap-3">
                <IconPhone
                  className="size-4 shrink-0 text-ink-muted"
                  aria-hidden
                />
                <a href={`tel:${tel}`} className="hover:text-ink">
                  {branch.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconMail
                  className="size-4 shrink-0 text-ink-muted"
                  aria-hidden
                />
                <a href={`mailto:${branch.email}`} className="hover:text-ink">
                  {branch.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconBrandWhatsapp
                  className="size-4 shrink-0 text-ink-muted"
                  aria-hidden
                />
                <a
                  href={buildWhatsAppLink(branch)}
                  target="_blank"
                  rel="noopener"
                  className="hover:text-ink"
                >
                  {t("Cta.whatsapp")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row">
          <span>
            © {new Date().getFullYear()} Bowling. {t("Footer.rights")}
          </span>
        </div>
      </div>
    </footer>
  )
}
