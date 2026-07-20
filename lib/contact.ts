// Builds the outbound WhatsApp link used across the site. The lead number is
// branch-specific and lives in each branch's data (see lib/branches.ts); pass
// the active branch's `whatsapp` value in. Waze links also come from branch data.

// Default message pre-filled when a visitor opens WhatsApp from the site.
const WHATSAPP_MESSAGE = "היי חייב שתחזרו אלי דחוף אני בדודא לבאולינג"

export const whatsappUrl = (
  whatsappNumber: string,
  message: string = WHATSAPP_MESSAGE
) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
