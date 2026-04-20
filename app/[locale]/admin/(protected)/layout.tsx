import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "@/i18n/navigation"
import { AdminNav } from "@/components/admin/admin-nav"
import { Toaster } from "@/components/ui/sonner"

export default async function AdminProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user.role !== "admin") {
    redirect({ href: "/admin/denied", locale })
  }
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <AdminNav />
      <div className="mt-8">{children}</div>
      <Toaster />
    </div>
  )
}
