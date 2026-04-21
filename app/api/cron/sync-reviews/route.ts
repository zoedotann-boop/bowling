import { NextResponse } from "next/server"

import { reviews } from "@/lib/services"

export const dynamic = "force-dynamic"
export const maxDuration = 300

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return process.env.NODE_ENV !== "production"
  }
  const header = req.headers.get("authorization")
  return header === `Bearer ${secret}`
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const branches = await reviews.listBranchesWithPlaceId()
  const results = await Promise.allSettled(
    branches.map((b) => reviews.syncBranch(b.id))
  )

  const summary = results.map((res, idx) => {
    const b = branches[idx]!
    if (res.status === "fulfilled") {
      return res.value.ok
        ? { slug: b.slug, ok: true, ...res.value.data }
        : { slug: b.slug, ok: false, errors: res.value.fieldErrors }
    }
    return {
      slug: b.slug,
      ok: false,
      error:
        res.reason instanceof Error ? res.reason.message : String(res.reason),
    }
  })

  console.info({
    event: "cron_sync_reviews",
    branches: summary.length,
    ok: summary.filter((s) => s.ok).length,
    failed: summary.filter((s) => !s.ok).length,
  })

  return NextResponse.json({ branches: summary })
}
