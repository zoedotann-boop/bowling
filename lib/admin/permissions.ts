// Single source of truth for admin roles and what each can do. Imported by both
// the sidebar (to filter nav) and the server actions (to gate writes) so the UI
// and the enforcement can never drift apart. Pure module — safe on the client.

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
