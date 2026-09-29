import { NextResponse, type NextRequest } from "next/server"

import { BRANCH_COOKIE, isBranchId } from "@/lib/branches"

export function proxy(request: NextRequest) {
  if (isBranchId(request.cookies.get(BRANCH_COOKIE)?.value)) return
  return NextResponse.rewrite(new URL("/branches", request.url))
}

export const config = {
  matcher: "/",
}
