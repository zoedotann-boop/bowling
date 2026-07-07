// Central place for outbound contact / navigation links used across the site.
// Update WHATSAPP_NUMBER to the branch's real WhatsApp number (international
// format, digits only, no "+").
export const WHATSAPP_NUMBER = "972537000834"

// Default message pre-filled when a visitor opens WhatsApp from the site.
export const WHATSAPP_MESSAGE = "היי הגעתי אליכם דרך האתר.."

export const whatsappUrl = (message: string = WHATSAPP_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

// Physical address of the branch, used for Waze navigation.
export const BRANCH_ADDRESS = "דרך אבא הלל 301, רמת גן"

// Opens Waze with turn-by-turn navigation straight to the branch.
export const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
  BRANCH_ADDRESS
)}&navigate=yes`
