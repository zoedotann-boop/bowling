/**
 * In-memory sliding-window rate limiter.
 *
 * Keyed on admin user id. 30 requests per hour per user.
 *
 * Known limits (deferred to sub-project I observability):
 *   - Resets on cold start; users moving across lambda instances may exceed the cap.
 *   - Not shared across deployments.
 *   - For MVP with 1–2 admins this is acceptable per roadmap §13.
 */

const LIMIT = 30
const WINDOW_MS = 60 * 60 * 1000

export class RateLimitError extends Error {
  constructor() {
    super("rate_limit")
    this.name = "RateLimitError"
  }
}

const buckets = new Map<string, number[]>()

export function consume(userId: string): void {
  const now = Date.now()
  const cutoff = now - WINDOW_MS
  const prev = buckets.get(userId) ?? []
  const fresh = prev.filter((t) => t > cutoff)
  if (fresh.length >= LIMIT) {
    buckets.set(userId, fresh)
    throw new RateLimitError()
  }
  fresh.push(now)
  buckets.set(userId, fresh)
}

export function __resetForTests(): void {
  buckets.clear()
}
