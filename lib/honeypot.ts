export const HONEYPOT_FIELD = "website"

export function isHoneypotFilled(payload: Record<string, unknown>): boolean {
  const value = payload[HONEYPOT_FIELD]
  return value != null && String(value).trim() !== ""
}
