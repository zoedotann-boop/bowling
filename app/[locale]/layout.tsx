import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import {
  Inter,
  JetBrains_Mono,
  Assistant,
  Cairo,
  Bagel_Fat_One,
  Russo_One,
  Suez_One,
  Lalezar,
} from "next/font/google"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { dirFromLocale, routing, type Locale } from "@/i18n/routing"

/* One UI font per script - used for both body and headings. */
const fontLatin = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-latin",
})
const fontHebrew = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-hebrew",
})
const fontArabic = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
})
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

/* Logo-only chunky display fonts. */
const fontDisplay = Bagel_Fat_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})
const fontDisplayCyrillic = Russo_One({
  subsets: ["cyrillic", "latin"],
  weight: "400",
  variable: "--font-display-cyrillic",
})
const fontDisplayHebrew = Suez_One({
  subsets: ["hebrew", "latin"],
  weight: "400",
  variable: "--font-display-hebrew",
})
const fontDisplayArabic = Lalezar({
  subsets: ["arabic", "latin"],
  weight: "400",
  variable: "--font-display-arabic",
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <html
      lang={locale}
      dir={dirFromLocale(locale as Locale)}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontLatin.variable,
        fontHebrew.variable,
        fontArabic.variable,
        fontMono.variable,
        fontDisplay.variable,
        fontDisplayCyrillic.variable,
        fontDisplayHebrew.variable,
        fontDisplayArabic.variable,
      )}
    >
      <body className="font-sans">
        <ThemeProvider defaultTheme="light">
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
