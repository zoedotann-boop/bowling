import { getTranslations } from "next-intl/server"
import { IconPhone } from "@tabler/icons-react"
import type { SiteBranch } from "@/lib/site-branch"

export async function SiteTopbar({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations("Hero")
  const tel = branch.phone.replace(/[^\d+]/g, "")
  return (
    <div className="bg-ink text-cream">
      <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-[11px] font-bold tracking-widest text-yellow">
          {t("openNow")}
        </span>
        <a
          href={`tel:${tel}`}
          dir="ltr"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-turq hover:text-yellow"
        >
          <IconPhone className="size-3.5" aria-hidden />
          {branch.phone}
        </a>
      </div>
    </div>
  )
}
