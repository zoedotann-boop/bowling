import { headers } from "next/headers"
import { setRequestLocale } from "next-intl/server"
import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { redirect } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect({
      href: session.user.role === "admin" ? "/admin" : "/admin/denied",
      locale,
    })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-surface-warm px-4 py-16 sm:py-24">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        {children}
      </div>
    </main>
  )
}
