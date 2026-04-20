/**
 * Vercel AI Gateway model constants.
 *
 * Authentication is resolved by @ai-sdk/gateway in this order:
 *   1. AI_GATEWAY_API_KEY env var (escape hatch for off-Vercel dev)
 *   2. VERCEL_OIDC_TOKEN via @vercel/oidc (default on Vercel and after `vercel env pull`)
 *
 * Local developer dev setup:
 *   - Preferred: `vercel env pull .env.local` → provisions a ~24h OIDC token.
 *   - Fallback: set AI_GATEWAY_API_KEY in .env.local (NOT added to .env.example by design).
 */

import type { Locale } from "@/i18n/routing"

export const TRANSLATION_MODEL = "anthropic/claude-haiku-4.5" as const

export const LOCALE_NAMES_EN: Record<Locale, string> = {
  he: "Hebrew",
  en: "English",
  ru: "Russian",
  ar: "Arabic",
}
