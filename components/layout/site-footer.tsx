import { getLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { type Branch } from "@/lib/branches"
import { buildWhatsAppLink } from "@/lib/whatsapp"

/**
 * SiteFooter — light cream-2 footer. Red BOWLING wordmark + turq city pill,
 * dashed ink divider, one row of contact + social (mono). No dark block.
 */
export async function SiteFooter({ branch }: { branch: Branch }) {
  const t = await getTranslations()
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const city = branch.city[locale]
  const tel = branch.phone.replace(/[^\d+]/g, "")
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t-2 border-ink/25 bg-cream-2 text-ink sm:mt-28">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Link
            href="/"
            aria-label={`Bowling ${city}`}
            className="inline-flex items-baseline gap-3"
            dir="ltr"
          >
            <span className="font-display text-2xl tracking-wide text-red sm:text-3xl">
              BOWLING
            </span>
            <span className="rounded-md bg-turq px-2 py-0.5 text-xs font-bold tracking-wider text-white">
              {city}
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
            <span className="text-ink/70">{branch.address[locale]}</span>
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

        <p className="mt-6 text-center font-mono text-[10px] tracking-[0.2em] text-ink/50">
          © {year} · BOWLING {city.toUpperCase()}
        </p>
      </div>
    </footer>
  )
}
