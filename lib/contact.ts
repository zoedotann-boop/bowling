// Central place for the outbound WhatsApp link used across the site.
// Update WHATSAPP_NUMBER to the branch's real WhatsApp number (international
// format, digits only, no "+"). Waze links come from each branch's data
// (see lib/branches.ts).
const WHATSAPP_NUMBER = "972537000834"

// Default message pre-filled when a visitor opens WhatsApp from the site.
const WHATSAPP_MESSAGE = "היי הגעתי אליכם דרך האתר.."

export const whatsappUrl = (message: string = WHATSAPP_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
