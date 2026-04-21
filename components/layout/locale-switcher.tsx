"use client"

import { useLocale, useTranslations } from "next-intl"
import { IconLanguage, IconCheck, IconChevronDown } from "@tabler/icons-react"
import { useRouter, usePathname } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const localeLabels: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  he: "עברית",
  ar: "العربية",
}

const localeShort: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  he: "HE",
  ar: "AR",
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
            variant="outline"
            size="sm"
            className="h-10 gap-2 px-3"
            aria-label={t("open")}
          />
        }
      >
        <IconLanguage className="size-4" aria-hidden />
        <span className="hidden text-sm font-bold sm:inline">
          {localeLabels[locale]}
        </span>
        <IconChevronDown className="size-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
        {routing.locales.map((l) => {
          const isCurrent = l === locale
          return (
            <DropdownMenuItem
              key={l}
              onClick={() => router.replace(pathname, { locale: l })}
              className="flex items-start gap-3 py-2.5"
            >
              <div className="flex-1">
                <div className="font-bold text-ink">{localeLabels[l]}</div>
                <div className="font-mono text-[10px] tracking-[0.14em] text-ink-soft uppercase">
                  {localeShort[l]}
                </div>
              </div>
              {isCurrent && (
                <IconCheck className="size-4 text-ink" aria-hidden />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
