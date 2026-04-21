import { NextResponse } from "next/server"

import { ForbiddenError, requireAdmin } from "@/lib/auth-guards"
import * as services from "@/lib/services"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }
    throw error
  }

  const { searchParams } = new URL(request.url)
  const branchId = searchParams.get("branchId")?.trim()
  if (!branchId) {
    return NextResponse.json({ error: "missingBranchId" }, { status: 400 })
  }

  const items = await services.media.listByBranch(branchId)
  return NextResponse.json({ items })
}
