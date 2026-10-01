import type { Branch } from "@/lib/branches"

export interface BirthdayInvitation {
  city: string
  when: string
  celebrants: string
  footer: string
  logoSrc: string
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const WEEKDAY = new Intl.DateTimeFormat("he-IL", {
  weekday: "long",
  timeZone: "UTC",
})

export function partyWhen(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : ""
  const match = ISO_DATE.exec(raw)
  if (!match) return raw && `תאריך: ${raw}`

  const [, year, month, day] = match
  const date = new Date(Date.UTC(+year, +month - 1, +day))
  if (date.getUTCMonth() !== +month - 1) return `תאריך: ${raw}`

  return `${WEEKDAY.format(date)} | תאריך: ${day}.${month}.${year.slice(2)}`
}

export function branchCity(branch: Branch): string {
  return branch.name.he.replace(/^סניף\s+/, "").trim()
}

export function birthdayInvitation(
  payload: Record<string, unknown>,
  branch: Branch
): BirthdayInvitation {
  const city = branchCity(branch)
  const celebrants =
    typeof payload.celebrants === "string" ? payload.celebrants.trim() : ""
  return {
    city,
    when: partyWhen(payload.date),
    celebrants,
    footer: [`באולינג ${city}`, branch.addressFull.he, branch.phone]
      .filter(Boolean)
      .join(" | "),
    logoSrc: branch.logo.src,
  }
}
