import { getTranslations } from "next-intl/server"
import { IconArrowRight } from "@tabler/icons-react"
import { Link } from "@/i18n/navigation"

export async function PageBack() {
  const t = await getTranslations("PageBack")
  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
      <Link
        href="/"
        className="inline-flex h-10 items-center gap-2 rounded-lg border-2 border-ink bg-paper px-3 text-xs font-bold text-ink shadow-block-sm transition active:translate-x-[1px] active:translate-y-[1px]"
      >
        <IconArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
        <span>{t("label")}</span>
      </Link>
    </div>
  )
}
