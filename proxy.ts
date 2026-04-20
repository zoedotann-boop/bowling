import createIntlMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"
import { routing } from "./i18n/routing"
import { resolveBranch } from "./lib/branches"
import { BRANCH_COOKIE } from "./lib/branch-context"

const intlMiddleware = createIntlMiddleware(routing)

export default function proxy(request: NextRequest) {
  const queryOverride = request.nextUrl.searchParams.get("branch")
  const envOverride =
    process.env.NODE_ENV !== "production"
      ? (process.env.BRANCH_OVERRIDE ?? null)
      : null
  const cookieBranch = request.cookies.get(BRANCH_COOKIE)?.value ?? null
  const host = request.headers.get("host")

  const branch = resolveBranch({
    override: queryOverride ?? envOverride ?? cookieBranch,
    host,
  })

  const response = intlMiddleware(request)
  response.cookies.set(BRANCH_COOKIE, branch.slug, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
}
