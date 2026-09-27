const WHATSAPP_MESSAGE = "היי חייב שתחזרו אלי דחוף אני בדודא לבאולינג"

export const whatsappUrl = (
  whatsappNumber: string,
  message: string = WHATSAPP_MESSAGE
) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
