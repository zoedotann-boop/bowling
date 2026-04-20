import { headers } from "next/headers"

import { auth } from "./auth"

export class ForbiddenError extends Error {
  constructor(message = "forbidden") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user.role !== "admin") {
    throw new ForbiddenError()
  }
  return session
}
