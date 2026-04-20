import type { Branch } from "./branches"

export function buildWhatsAppLink(
  branch: Pick<Branch, "whatsapp">,
  message?: string
): string {
  const base = `https://wa.me/${branch.whatsapp}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
