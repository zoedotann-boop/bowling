import { NextResponse } from "next/server"

import { ForbiddenError, requireAdmin } from "@/lib/auth-guards"
import * as services from "@/lib/services"

export const runtime = "nodejs"

export async function GET() {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }
    throw error
  }

  const items = await services.media.list()
  return NextResponse.json({ items })
}
