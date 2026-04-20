import { getLocale, getTranslations } from "next-intl/server"
import {
  IconBrandWhatsapp,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"
import { buildWhatsAppLink } from "@/lib/whatsapp"

export async function ContactInfoCard({ branch }: { branch: Branch }) {
  const t = await getTranslations()
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const tel = branch.phone.replace(/[^\d+]/g, "")

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
      <div className="space-y-5">
        <Row
          icon={<IconMapPin className="size-5" aria-hidden />}
          label={t("Contact.address")}
        >
          <a
            href={branch.mapUrl}
            target="_blank"
            rel="noopener"
            className="text-ink hover:underline"
          >
            {branch.address[locale]}
          </a>
        </Row>
        <Row
          icon={<IconPhone className="size-5" aria-hidden />}
          label={t("Contact.phone")}
        >
          <a href={`tel:${tel}`} className="text-ink hover:underline">
            {branch.phone}
          </a>
        </Row>
        <Row
          icon={<IconMail className="size-5" aria-hidden />}
          label={t("Contact.email")}
        >
          <a
            href={`mailto:${branch.email}`}
            className="text-ink hover:underline"
          >
            {branch.email}
          </a>
        </Row>
      </div>
      <a
        href={buildWhatsAppLink(branch)}
        target="_blank"
        rel="noopener"
        className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp text-sm font-medium text-white shadow-soft transition hover:bg-whatsapp-hover"
      >
        <IconBrandWhatsapp className="size-5" aria-hidden />
        {t("Cta.whatsapp")}
      </a>
    </div>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-ink-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium tracking-[0.16em] text-ink-muted uppercase">
          {label}
        </div>
        <div className="mt-1 text-sm">{children}</div>
      </div>
    </div>
  )
}
