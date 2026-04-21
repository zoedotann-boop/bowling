"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { BRANCH_COOKIE } from "@/lib/site-branch"

export async function selectBranch(slug: string): Promise<void> {
  const jar = await cookies()
  jar.set(BRANCH_COOKIE, slug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
  revalidatePath("/", "layout")
}
