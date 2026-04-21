import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import {
  Heebo,
  Courier_Prime,
  Cairo,
  Alfa_Slab_One,
  Russo_One,
  Miriam_Libre,
  Lalezar,
} from "next/font/google"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { dirFromLocale, routing, type Locale } from "@/i18n/routing"

/* One body font per script - used for both body and headings. */
const fontLatin = Heebo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-latin",
})
const fontHebrew = Miriam_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "700"],
  variable: "--font-hebrew",
})
const fontArabic = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
})
const fontMono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

/* Chunky signboard display fonts — one per script. */
const fontDisplay = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})
const fontDisplayCyrillic = Russo_One({
  subsets: ["cyrillic", "latin"],
  weight: "400",
  variable: "--font-display-cyrillic",
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
        fontDisplayArabic.variable
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
