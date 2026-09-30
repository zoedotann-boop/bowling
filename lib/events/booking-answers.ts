const FIELD_LABELS: Record<string, string> = {
  event: "אירוע",
  firstName: "שם פרטי",
  lastName: "שם משפחה",
  idNumber: "ת.ז",
  celebrants: "שמות החוגגים",
  email: "אימייל",
  phone: "טלפון",
  date: "תאריך",
}

const RESERVED_KEYS = new Set(["branch", "signature", "upgrades", "labels"])

function readLabels(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null) return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].trim() !== ""
    )
  )
}

export function bookingAnswers(
  payload: Record<string, unknown>
): [string, string][] {
  const labels = readLabels(payload.labels)
  return Object.entries(payload)
    .filter(
      (entry): entry is [string, string] =>
        !RESERVED_KEYS.has(entry[0]) &&
        typeof entry[1] === "string" &&
        entry[1].trim() !== ""
    )
    .map(([key, value]) => [labels[key] ?? FIELD_LABELS[key] ?? key, value])
}
