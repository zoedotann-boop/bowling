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
