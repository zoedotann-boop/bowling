import type { Metadata, Viewport } from "next"
import { Rubik, Heebo } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"

import "./globals.css"
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
  themeColor: "#1a1a1a",
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
      dir={locale === "he" ? "rtl" : "ltr"}
      className={cn(
        "dark antialiased",
        rubik.variable,
        heebo.variable,
        "font-sans"
      )}
    >
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
