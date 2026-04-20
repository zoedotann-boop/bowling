import { headers } from "next/headers"
import { setRequestLocale } from "next-intl/server"
import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { redirect } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

export default async function AdminLayout({
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
  if (!session?.user) {
    redirect({ href: "/login", locale })
  }

  return <div className="min-h-svh bg-background">{children}</div>
}
