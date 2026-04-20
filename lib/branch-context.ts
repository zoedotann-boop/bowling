import { cookies, headers } from "next/headers"
import { resolveBranch, type Branch } from "./branches"

export const BRANCH_COOKIE = "bowling_branch"

export async function getCurrentBranch(): Promise<Branch> {
  const [c, h] = await Promise.all([cookies(), headers()])
  const cookieBranch = c.get(BRANCH_COOKIE)?.value ?? null
  const host = h.get("x-forwarded-host") ?? h.get("host")
  return resolveBranch({ override: cookieBranch, host })
}
