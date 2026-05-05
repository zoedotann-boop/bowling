import { getTranslations } from "next-intl/server"
import {
  IconBrandWhatsapp,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react"
import type { SiteBranch } from "@/lib/site-branch"
import { RetroButton } from "@/components/brand/retro-button"
import { Eyebrow } from "@/components/common/eyebrow"
import { buildWhatsAppLink } from "@/lib/whatsapp"

export async function ContactBlock({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations()
  const tContact = await getTranslations("Contact")
  const tHero = await getTranslations("Hero")
  const tel = branch.phone.replace(/[^\d+]/g, "")

  const quickContacts = [
    {
      key: "whatsapp",
      Icon: IconBrandWhatsapp,
      label: t("Cta.whatsapp"),
      sub: t("Contact.replyFast"),
      href: buildWhatsAppLink(branch),
      external: true,
    },
    {
      key: "phone",
      Icon: IconPhone,
      label: tContact("phone"),
      sub: branch.phone,
      href: `tel:${tel}`,
      external: false,
    },
    {
      key: "email",
      Icon: IconMail,
      label: tContact("email"),
      sub: branch.email,
      href: `mailto:${branch.email}`,
      external: false,
    },
    {
      key: "map",
      Icon: IconMapPin,
      label: t("Cta.getDirections"),
      sub: branch.city,
      href: branch.mapUrl,
      external: true,
    },
  ] as const

  return (
    <section id="contact" className="scroll-mt-24 bg-cream-2">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
        <Eyebrow tone="red">{tContact("title")}</Eyebrow>
        <h2 className="mt-2 font-display text-2xl leading-[1.05] text-ink sm:text-3xl">
          {branch.address}
        </h2>
        <p className="mt-2 text-sm text-ink/70">{branch.city}</p>

        <ul className="mt-5 grid grid-cols-2 gap-3">
          {quickContacts.map(({ key, Icon, label, sub, href, external }) => (
            <li key={key}>
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener" : undefined}
                className="flex h-full items-start gap-3 border-2 border-ink bg-paper px-3 py-3 text-start shadow-block-sm transition active:translate-x-[1px] active:translate-y-[1px]"
              >
                <span className="grid size-9 shrink-0 place-items-center border-2 border-ink bg-yellow text-ink">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">
                    {label}
                  </span>
                  <span className="block truncate text-xs text-ink/70">
                    {sub}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-2 border-ink bg-paper">
          {branch.hours.map((h, i) => (
            <div
              key={i}
              className={`flex items-baseline justify-between gap-3 px-4 py-2.5 ${
                i < branch.hours.length - 1
                  ? "border-b-2 border-dashed border-ink/15"
                  : ""
              }`}
            >
              <span className="text-sm font-extrabold text-ink">{h.day}</span>
              <span
                className="font-mono text-xs text-ink/70 tabular-nums"
                dir="ltr"
              >
                {h.isClosed ? tHero("closedNow") : `${h.open} – ${h.close}`}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <RetroButton
            tone="ink"
            full
            render={
              <a href={branch.mapUrl} target="_blank" rel="noopener">
                <IconMapPin aria-hidden />
                {t("Cta.getDirections")}
              </a>
            }
          />
        </div>
      </div>
    </section>
  )
}
