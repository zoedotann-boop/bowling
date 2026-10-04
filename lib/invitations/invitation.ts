import type { Branch } from "@/lib/branches"
import { clockTime } from "@/lib/events/fields"
import { isBirthdayEvent } from "@/lib/events/slugs"

export interface Invitation {
  message: string
  when: string
  host: string
  footer: string
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const WEEKDAY = new Intl.DateTimeFormat("he-IL", {
  weekday: "long",
  timeZone: "UTC",
})

function partyDate(raw: string): string {
  const match = ISO_DATE.exec(raw)
  if (!match) return raw && `תאריך: ${raw}`

  const [, year, month, day] = match
  const date = new Date(Date.UTC(+year, +month - 1, +day))
  if (date.getUTCMonth() !== +month - 1) return `תאריך: ${raw}`

  return `${WEEKDAY.format(date)} | תאריך: ${day}.${month}.${year.slice(2)}`
}

const TIME = /^([01]?\d|2[0-3]):([0-5]\d)$/
const ARRIVE_EARLY_MINUTES = 15
const MINUTES_PER_DAY = 24 * 60

export function arrivalTime(raw: string): string {
  const match = TIME.exec(raw)
  if (!match) return raw

  return clockTime(
    (+match[1] * 60 + +match[2] - ARRIVE_EARLY_MINUTES + MINUTES_PER_DAY) %
      MINUTES_PER_DAY
  )
}

export function partyWhen(date: string, time: string): string {
  return [partyDate(date), time && `שעה: ${arrivalTime(time)}`]
    .filter(Boolean)
    .join(" | ")
}

export function branchCity(branch: Branch): string {
  return branch.name.he.replace(/^סניף\s+/, "").trim()
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function answerOfType(
  payload: Record<string, unknown>,
  type: "date" | "time"
): string {
  const types =
    typeof payload.types === "object" && payload.types !== null
      ? (payload.types as Record<string, unknown>)
      : {}
  const key = Object.keys(types).find(
    (field) => types[field] === type && text(payload[field])
  )
  return text(payload[key ?? type])
}

function invitationMessage(slug: unknown, city: string): string {
  const invite = isBirthdayEvent(slug)
    ? "אשמח להזמין אותך למסיבת יום ההולדת הכי שווה שיש!"
    : "אשמח להזמין אותך לחגוג איתי!"
  return `אז החלטתי לחגוג בבאולינג ${city}!\n${invite}`
}

export function eventInvitation(
  payload: Record<string, unknown>,
  branch: Branch
): Invitation {
  const city = branchCity(branch)
  return {
    message: invitationMessage(payload.slug, city),
    when: partyWhen(
      answerOfType(payload, "date"),
      answerOfType(payload, "time")
    ),
    host: text(payload.celebrants) || text(payload.firstName),
    footer: [`באולינג ${city}`, branch.addressFull.he, branch.phone]
      .filter(Boolean)
      .join(" | "),
  }
}
