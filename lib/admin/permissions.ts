export const ADMIN_ROLES = ["owner", "manager"] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]
