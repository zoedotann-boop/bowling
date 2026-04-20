import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { SignOutButton } from "@/components/auth/sign-out-button"

export const metadata: Metadata = {
  title: "אזור ניהול",
  robots: { index: false, follow: false },
}

export default async function AdminHomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const name = session?.user.name ?? session?.user.email ?? ""

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-ink-muted">אזור ניהול</p>
          <h1 className="text-3xl font-semibold text-ink">שלום, {name}</h1>
        </div>
        <SignOutButton />
      </header>
      <div className="rounded-3xl border border-line bg-surface p-10 text-center text-ink-muted shadow-soft">
        דף הניהול עדיין ריק. תוכן יתווסף בהמשך.
      </div>
    </div>
  )
}
