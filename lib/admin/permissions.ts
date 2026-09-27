export const ADMIN_ROLES = ["owner", "manager", "staff"] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export type AdminCapability = "content" | "settings" | "operations"

const ROLE_CAPABILITIES: Record<AdminRole, AdminCapability[]> = {
  owner: ["content", "settings", "operations"],
  manager: ["content", "settings", "operations"],
  staff: ["content"],
}

export function can(role: AdminRole, capability: AdminCapability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability)
}
