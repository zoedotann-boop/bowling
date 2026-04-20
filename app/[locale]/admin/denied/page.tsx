import type { Metadata } from "next"
import { IconLock } from "@tabler/icons-react"
import { SignOutButton } from "@/components/auth/sign-out-button"

export const metadata: Metadata = {
  title: "אין הרשאה",
  robots: { index: false, follow: false },
}

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 shadow-soft">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
            <IconLock className="size-7" aria-hidden />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-ink">אין הרשאה</h1>
            <p className="text-sm text-ink-muted">
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
