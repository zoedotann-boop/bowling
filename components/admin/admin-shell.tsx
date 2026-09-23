"use client"

import {
  Home,
  Inbox,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  PanelRightClose,
  PanelRightOpen,
  PartyPopper,
  Settings,
  UtensilsCrossed,
  Users,
  X,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { AdminSelect } from "@/components/admin/admin-ui"
import { ToastProvider } from "@/components/admin/toast"
import {
  can,
  type AdminCapability,
  type AdminRole,
} from "@/lib/admin/permissions"
import {
  ADMIN_LOGIN_PATH,
  ADMIN_SECTIONS,
  locationSectionPath,
  OWNER_SECTIONS,
} from "@/lib/admin/routes"
import { authClient } from "@/lib/auth-client"
import type { Localized } from "@/lib/db/schema/_shared"
import { pickLocale } from "@/lib/localized"
import type { Locale } from "@/lib/locales"
import { cn } from "@/lib/utils"

const SECTION_ICONS: Record<string, typeof Home> = {
  general: Settings,
  home: Home,
  menu: UtensilsCrossed,
  events: PartyPopper,
  leads: Inbox,
  locations: MapPin,
  team: Users,
}

export interface AdminShellLocation {
  slug: string
  name: Localized
}

export interface AdminShellUser {
  name: string
  email: string
  role: AdminRole
}

const COLLAPSE_KEY = "admin:sidebar-collapsed"
const COLLAPSE_EVENT = "admin:sidebar-collapse"

// Persisted (localStorage) sidebar collapse preference, read via an external
// store so there's no setState-in-effect on mount.
function useCollapsed(): [boolean, () => void] {
  const collapsed = useSyncExternalStore(
    (onChange) => {
      window.addEventListener(COLLAPSE_EVENT, onChange)
      return () => window.removeEventListener(COLLAPSE_EVENT, onChange)
    },
    () => localStorage.getItem(COLLAPSE_KEY) === "1",
    () => false
  )
  const toggle = () => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "0" : "1")
    window.dispatchEvent(new Event(COLLAPSE_EVENT))
  }
  return [collapsed, toggle]
}

export function AdminShell({
  user,
  locations,
  children,
}: {
  user: AdminShellUser
  locations: AdminShellLocation[]
  children: React.ReactNode
}) {
  const t = useTranslations("admin.nav")
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, toggleCollapsed] = useCollapsed()
  const [mobileOpen, setMobileOpen] = useState(false)

  const segments = pathname.split("/")
  const slugFromPath = segments[2]
  const activeSlug =
    locations.find((item) => item.slug === slugFromPath)?.slug ??
    locations[0]?.slug ??
    ""
  const currentSection = segments[3] ?? "general"

  function onSwitchLocation(slug: string) {
    router.push(locationSectionPath(slug, currentSection))
  }

  const sections = ADMIN_SECTIONS.filter((section) =>
    can(user.role, section.capability as AdminCapability)
  )

  async function handleSignOut() {
    await authClient.signOut()
    router.push(ADMIN_LOGIN_PATH)
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
      {locations.length > 1 && !collapsed && (
        <div className="mb-2">
          <AdminSelect
            value={activeSlug}
            onChange={(event) => onSwitchLocation(event.target.value)}
            className="h-8"
            aria-label={t("location")}
          >
            {locations.map((item) => (
              <option key={item.slug} value={item.slug}>
                {pickLocale(item.name, locale)}
              </option>
            ))}
          </AdminSelect>
        </div>
      )}

      {activeSlug !== "" &&
        sections.map((section) => {
          const Icon = SECTION_ICONS[section.key] ?? Home
          const href = locationSectionPath(activeSlug, section.key)
          const active = currentSection === section.key
          return (
            <NavLink
              key={section.key}
              href={href}
              icon={<Icon className="size-4" />}
              label={t(section.key)}
              active={active}
              collapsed={collapsed}
              onNavigate={() => setMobileOpen(false)}
            />
          )
        })}

      {user.role === "owner" && (
        <>
          <div className="my-2 border-t border-sidebar-border" />
          {OWNER_SECTIONS.map((section) => {
            const Icon = SECTION_ICONS[section.key] ?? Home
            const active = pathname.startsWith(section.path)
            return (
              <NavLink
                key={section.key}
                href={section.path}
                icon={<Icon className="size-4" />}
                label={t(section.key)}
                active={active}
                collapsed={collapsed}
                onNavigate={() => setMobileOpen(false)}
              />
            )
          })}
        </>
      )}
    </nav>
  )

  const sidebar = (
    <aside
      className={cn(
        "flex h-full flex-col border-s border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width]",
        collapsed ? "w-14" : "w-60"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border p-2">
        {!collapsed && (
          <span className="ps-1 text-sm font-semibold">{t("brand")}</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("collapseSidebar")}
          onClick={toggleCollapsed}
          className="hidden md:inline-flex"
        >
          {collapsed ? <PanelRightOpen /> : <PanelRightClose />}
        </Button>
      </div>
      {nav}
      <div className="border-t border-sidebar-border p-2">
        {!collapsed && (
          <div className="mb-1 truncate px-1 text-xs text-muted-foreground">
            {user.name}
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start"
        >
          <LogOut />
          {!collapsed && t("signOut")}
        </Button>
      </div>
    </aside>
  )

  return (
    <ToastProvider>
      <div className="flex h-svh overflow-hidden bg-cream">
        {/* Desktop sidebar */}
        <div className="hidden md:block">{sidebar}</div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label={t("close")}
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 end-0 flex">
              <div className="relative">{sidebar}</div>
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-2 border-b border-border p-2 md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("openMenu")}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X /> : <MenuIcon />}
            </Button>
            <span className="text-sm font-semibold">{t("brand")}</span>
          </header>
          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}

function NavLink({
  href,
  icon,
  label,
  active,
  collapsed,
  onNavigate,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  collapsed: boolean
  onNavigate: () => void
}) {
  const router = useRouter()
  return (
    <button
      type="button"
      title={collapsed ? label : undefined}
      onClick={() => {
        onNavigate()
        router.push(href)
      }}
      className={cn(
        "flex h-8 items-center gap-2 rounded-md px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )
}
