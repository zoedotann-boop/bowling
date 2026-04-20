import type { Metadata } from "next"
import { IconLock } from "@tabler/icons-react"
import { BowlingLogo } from "@/components/brand/bowling-logo"
import { SignOutButton } from "@/components/auth/sign-out-button"

export const metadata: Metadata = {
  title: "אין הרשאה",
  robots: { index: false, follow: false },
}

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-surface-warm px-4 py-16 sm:py-24">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <BowlingLogo city="Admin" size="sm" />
          <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <IconLock className="size-6" aria-hidden />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl text-ink sm:text-3xl">
              אין הרשאה
            </h1>
            <p className="text-sm text-ink-soft">
              החשבון שלך אינו מורשה לגשת לאזור הניהול. אם זו טעות, פנה/י למנהל/ת
              המערכת.
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </main>
  )
}
