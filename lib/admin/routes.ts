import type { AdminCapability } from "./permissions"

export const ADMIN_ROOT = "/admin"
export const ADMIN_LOGIN_PATH = "/admin/login"

export function locationSectionPath(slug: string, section: string): string {
  return `${ADMIN_ROOT}/${slug}/${section}`
}

export interface AdminSection {
  key: string
  capability: AdminCapability
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { key: "general", capability: "settings" },
  { key: "home", capability: "content" },
  { key: "reviews", capability: "content" },
  { key: "menu", capability: "content" },
  { key: "events", capability: "content" },
  { key: "legal", capability: "settings" },
]

export const OWNER_SECTIONS = [
  { key: "locations", path: `${ADMIN_ROOT}/locations` },
  { key: "team", path: `${ADMIN_ROOT}/team` },
] as const
