import type { Metadata, Viewport } from "next"
import { Rubik, Heebo } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { PageTransition } from "@/components/page-transition"
import { PromoBar } from "@/components/home/promo-bar"
import { SiteHeader } from "@/components/home/site-header"
import { SiteFooter } from "@/components/home/site-footer"
import { cn } from "@/lib/utils"

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
})

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export const viewport: Viewport = {
  themeColor: "#14213d",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      dir="rtl"
      suppressHydrationWarning
      className={cn("antialiased", rubik.variable, heebo.variable, "font-sans")}
    >
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>
            <div className="flex min-h-svh flex-col bg-cream">
              <PromoBar />
              <SiteHeader />
              <main className="flex-1">
                <PageTransition>{children}</PageTransition>
              </main>
              <SiteFooter />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
