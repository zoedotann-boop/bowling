import type { Metadata, Viewport } from "next"
import { Rubik, Heebo } from "next/font/google"
import { cookies } from "next/headers"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { PageTransition } from "@/components/page-transition"
import { BranchProvider } from "@/components/branch-context"
import { BranchNotice } from "@/components/home/branch-notice"
import { SiteHeader } from "@/components/home/site-header"
import { SiteFooter } from "@/components/home/site-footer"
import { MobileFloatingActions } from "@/components/home/mobile-floating-actions"
import { BRANCH_COOKIE, DEFAULT_BRANCH, isBranchId } from "@/lib/branches"
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
  const cookieStore = await cookies()
  const branchCookie = cookieStore.get(BRANCH_COOKIE)?.value
  const initialBranch = isBranchId(branchCookie) ? branchCookie : DEFAULT_BRANCH

  return (
    <html
      lang={locale}
      dir={locale === "he" ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={cn("antialiased", rubik.variable, heebo.variable, "font-sans")}
    >
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>
            <BranchProvider initial={initialBranch}>
              <div className="flex min-h-svh flex-col bg-cream">
                <SiteHeader />
                <main className="flex-1">
                  <PageTransition>{children}</PageTransition>
                </main>
                <SiteFooter />
                {/* Spacer so the mobile sticky action bar never covers the footer */}
                <div className="h-[72px] lg:hidden" aria-hidden />
                <MobileFloatingActions />
              </div>
              <BranchNotice />
            </BranchProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
