export function buildWhatsAppLink(
  branch: { whatsapp: string },
  message?: string
): string {
  const base = `https://wa.me/${branch.whatsapp}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
