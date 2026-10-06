export const BUILT_IN_EVENTS = [
  "birthdays",
  "no-room",
  "team",
  "gymboree",
  "corporate",
] as const

const CONTACT_FORM_EVENTS: readonly string[] = ["corporate", "team"]

export function usesContactForm(slug: string): boolean {
  return CONTACT_FORM_EVENTS.includes(slug)
}

const BIRTHDAY_EVENTS: readonly string[] = ["birthdays", "gymboree", "no-room"]

export function isBirthdayEvent(slug: unknown): boolean {
  return typeof slug === "string" && BIRTHDAY_EVENTS.includes(slug)
}

export function waiverPath(branch: string, slug: string): string {
  return `/${branch}/events/${slug}/waiver`
}
