"use client"

import { useLocale, useTranslations } from "next-intl"
import { IconLanguage, IconCheck } from "@tabler/icons-react"
import { useRouter, usePathname } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const localeLabels: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  he: "עברית",
  ar: "العربية",
}

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher")
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-10 gap-2 rounded-full px-3 text-ink hover:bg-surface-muted"
            aria-label={t("open")}
          />
        }
      >
        <IconLanguage className="size-4 text-ink-muted" aria-hidden />
        <span className="hidden text-sm font-medium sm:inline">
          {localeLabels[locale]}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-2xl border border-line bg-surface p-1.5 shadow-card"
      >
        {routing.locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => router.replace(pathname, { locale: l })}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          >
            <span className="flex-1 text-sm">{localeLabels[l]}</span>
            {l === locale && (
              <IconCheck className="size-4 text-ink" aria-hidden />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
