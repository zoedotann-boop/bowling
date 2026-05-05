import { getTranslations } from "next-intl/server"
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
} from "@tabler/icons-react"
import { Link } from "@/i18n/navigation"
import type { SiteBranch } from "@/lib/site-branch"
import { buildWhatsAppLink } from "@/lib/whatsapp"

type SocialItem = {
  key: "instagram" | "facebook" | "tiktok"
  href: string
  Icon: React.ComponentType<{ className?: string }>
}

const SOCIAL_ITEMS: SocialItem[] = [
  {
    key: "instagram",
    href: "https://www.instagram.com/",
    Icon: IconBrandInstagram,
  },
  {
    key: "facebook",
    href: "https://www.facebook.com/",
    Icon: IconBrandFacebook,
  },
  {
    key: "tiktok",
    href: "https://www.tiktok.com/",
    Icon: IconBrandTiktok,
  },
]

export async function SiteFooter({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations()
  const tSocial = await getTranslations("Social")
  const tel = branch.phone.replace(/[^\d+]/g, "")
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t-2 border-ink/25 bg-cream-2 text-ink sm:mt-28">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Link
            href="/"
            aria-label={`Bowling ${branch.city}`}
            className="inline-flex items-baseline gap-3"
            dir="ltr"
          >
            <span className="font-display text-2xl tracking-wide text-red sm:text-3xl">
              BOWLING
            </span>
            <span className="rounded-md bg-turq px-2 py-0.5 text-xs font-bold tracking-wider text-white">
              {branch.city}
            </span>
          </Link>
          <span className="font-mono text-[11px] tracking-[0.2em] text-ink/60">
            EST · 1974
          </span>
        </div>

        <div
          aria-hidden
          className="my-5 border-t-2 border-dashed border-ink/25"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap gap-4">
            <a href={`tel:${tel}`} className="font-bold hover:text-red">
              {branch.phone}
            </a>
            <span className="text-ink/70">{branch.address}</span>
          </div>
          <div className="flex gap-4 font-mono text-[11px] tracking-widest">
            <a
              href={buildWhatsAppLink(branch)}
              target="_blank"
              rel="noopener"
              className="text-red hover:text-ink"
            >
              {t("Cta.whatsapp").toUpperCase()}
            </a>
            <a
              href={`mailto:${branch.email}`}
              className="text-turq-2 hover:text-ink"
            >
              EMAIL
            </a>
          </div>
        </div>

        <section className="mt-8">
          <div className="font-mono text-[11px] font-bold tracking-[0.22em] text-red uppercase">
            {tSocial("title")}
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:max-w-md">
            {SOCIAL_ITEMS.map(({ key, href, Icon }) => (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-ink bg-paper px-3 py-3 text-ink shadow-block-sm transition active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="text-xs font-bold">{tSocial(key)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {branch.legalLinks.length > 0 ? (
          <nav className="mt-7 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
            {branch.legalLinks.map((link) => (
              <Link
                key={link.slug}
                href={`/legal/${link.slug}`}
                className="text-ink/70 hover:text-red"
              >
                {link.title}
              </Link>
            ))}
          </nav>
        ) : null}

        <p className="mt-6 text-center font-mono text-[10px] tracking-[0.2em] text-ink/50">
          © {year} · BOWLING {branch.city.toUpperCase()}
        </p>
      </div>
    </footer>
  )
}
