import { headers } from "next/headers"
import { setRequestLocale } from "next-intl/server"
import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { redirect } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { BowlingCard } from "@/components/brand/bowling-card"
import { BowlingLogo } from "@/components/brand/bowling-logo"
import { Ball, Burst, Pin } from "@/components/brand/glyphs"

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
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-cream px-4 py-16">
      <Burst
        size={220}
        className="pointer-events-none absolute -start-10 -top-10 opacity-60"
      />
      <Ball
        size={64}
        className="pointer-events-none absolute end-10 top-16 hidden sm:block"
      />
      <Pin
        size={56}
        className="pointer-events-none absolute start-8 bottom-10 hidden sm:block"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BowlingLogo city="Admin" size="sm" />
        </div>
        <BowlingCard
          surface="paper"
          ring="red"
          shadow="lg"
          contentClassName="px-6 py-8 sm:px-8"
        >
          {children}
        </BowlingCard>
      </div>
    </main>
  )
}
