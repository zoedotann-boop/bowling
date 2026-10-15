import type { AdminRole } from "./permissions"

export const ADMIN_ROOT = "/admin"
export const ADMIN_LOGIN_PATH = "/admin/login"
export const DEFAULT_ADMIN_SECTION = "home"

export function locationSectionPath(slug: string, section: string): string {
  return `${ADMIN_ROOT}/${slug}/${section}`
}

interface AdminSection {
  key: string
  ownerOnly?: boolean
}

const ADMIN_SECTIONS: AdminSection[] = [
  { key: "general" },
  { key: "home" },
  { key: "reviews", ownerOnly: true },
  { key: "menu" },
  { key: "events" },
  { key: "legal" },
]

export function sectionsFor(role: AdminRole): AdminSection[] {
  return ADMIN_SECTIONS.filter(
    (section) => !section.ownerOnly || role === "owner"
  )
}

export const OWNER_SECTIONS = [
  { key: "locations", path: `${ADMIN_ROOT}/locations` },
  { key: "team", path: `${ADMIN_ROOT}/team` },
] as const

export function setPasswordPath(email: string): string {
  return `${ADMIN_ROOT}/set-password?${new URLSearchParams({ email })}`
}
