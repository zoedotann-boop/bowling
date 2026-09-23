import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/admin/login-form"
import { ADMIN_ROOT } from "@/lib/admin/routes"
import { auth } from "@/lib/auth"

// Login lives outside the (dashboard) auth gate so it stays reachable when
// signed out. Already-authenticated users are bounced into the dashboard.
export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect(ADMIN_ROOT)

  return (
    <div className="flex min-h-svh items-center justify-center bg-cream p-4">
      <LoginForm />
    </div>
  )
}
