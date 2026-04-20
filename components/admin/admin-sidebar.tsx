"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  IconBuildingStore,
  IconChevronUp,
  IconLogout,
  IconPhoto,
} from "@tabler/icons-react"

import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

type SidebarUser = {
  name: string | null | undefined
  email: string | null | undefined
  image: string | null | undefined
}

type AdminSidebarProps = {
  user: SidebarUser
}

type NavItem = {
  href: string
  labelKey: "branches" | "media"
  icon: React.ComponentType<{ className?: string }>
  match: (pathname: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin/branches",
    labelKey: "branches",
    icon: IconBuildingStore,
    match: (p) => /\/admin\/branches(\/|$)/.test(p),
  },
  {
    href: "/admin/media",
    labelKey: "media",
    icon: IconPhoto,
    match: (p) => /\/admin\/media(\/|$)/.test(p),
  },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const t = useTranslations("Admin.nav")
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-10 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div
            aria-hidden
            className="grid size-6 shrink-0 place-items-center bg-ink text-[10px] font-semibold text-surface"
          >
            B
          </div>
          <span className="truncate text-sm font-semibold tracking-tight text-ink group-data-[collapsible=icon]:hidden">
            {t("brand")}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = item.match(pathname)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={t(item.labelKey)}
                      render={
                        <Link href={item.href}>
                          <Icon />
                          <span>{t(item.labelKey)}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function UserMenu({ user }: { user: SidebarUser }) {
  const t = useTranslations("Admin.nav")
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  const displayName = user.name?.trim() || user.email || ""
  const email = user.email ?? ""
  const initials = getInitials(displayName || email)

  function handleSignOut() {
    startTransition(async () => {
      await authClient.signOut()
      router.push("/login")
      router.refresh()
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar size="sm" className="rounded-none">
                  {user.image ? (
                    <AvatarImage
                      src={user.image}
                      alt={displayName || email}
                      className="rounded-none"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-none bg-ink text-[10px] font-semibold text-surface">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col text-start leading-tight">
                  <span className="truncate text-xs font-medium text-ink">
                    {displayName}
                  </span>
                  {email && email !== displayName ? (
                    <span className="truncate text-[11px] text-ink-muted">
                      {email}
                    </span>
                  ) : null}
                </div>
                <IconChevronUp className="ms-auto size-4 shrink-0 text-ink-muted" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            side="top"
            align="end"
            className="min-w-(--anchor-width)"
          >
            <DropdownMenuLabel className="truncate">
              {email || displayName}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={pending}
              variant="destructive"
            >
              <IconLogout />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function getInitials(source: string): string {
  const trimmed = source.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    const first = parts[0]!
    return first.slice(0, 2).toUpperCase()
  }
  return (
    parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
  ).toUpperCase()
}
