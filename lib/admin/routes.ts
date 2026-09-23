import type { AdminCapability } from "./permissions"

// Client-safe route constants and nav definitions. Kept separate from the
// server-only access layer so client components can import paths without
// pulling in `server-only` code.

export const ADMIN_ROOT = "/admin"
export const ADMIN_LOGIN_PATH = "/admin/login"

export function locationSectionPath(slug: string, section: string): string {
  return `${ADMIN_ROOT}/${slug}/${section}`
}

// Per-location content/settings sections shown in the sidebar for the active
// location. `nameKey` is a key under the `admin.nav` i18n namespace.
export interface AdminSection {
  key: string
  capability: AdminCapability
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { key: "general", capability: "settings" },
  { key: "home", capability: "content" },
  { key: "menu", capability: "content" },
  { key: "events", capability: "content" },
  { key: "leads", capability: "leads" },
]

// Owner-only top-level pages (not tied to a single location).
export const OWNER_SECTIONS = [
  { key: "locations", path: `${ADMIN_ROOT}/locations` },
  { key: "team", path: `${ADMIN_ROOT}/team` },
] as const
