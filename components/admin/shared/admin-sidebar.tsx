"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  IconChevronUp,
  IconLogout,
  IconPhoto,
  IconReceipt,
  IconSettings,
  IconStar,
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

type BranchOption = {
  slug: string
  displayName: string
}

type AdminSidebarProps = {
  user: SidebarUser
  branches: BranchOption[]
}

type BranchNavKey = "general" | "pricelists" | "reviews" | "media"

type BranchNavItem = {
  key: BranchNavKey
  icon: React.ComponentType<{ className?: string }>
}

const BRANCH_NAV_ITEMS: BranchNavItem[] = [
  { key: "general", icon: IconSettings },
  { key: "pricelists", icon: IconReceipt },
  { key: "reviews", icon: IconStar },
  { key: "media", icon: IconPhoto },
]

function extractBranchSlug(pathname: string): string | null {
  const match = pathname.match(/\/admin\/branches\/([^/]+)(?:\/|$)/)
  if (!match) return null
  const slug = match[1]!
  if (slug === "new") return null
  return slug
}

export function AdminSidebar({ user, branches }: AdminSidebarProps) {
  const t = useTranslations("Admin.nav")
  const tTabs = useTranslations("Admin.branches.tabs")
  const pathname = usePathname()

  const currentSlug = extractBranchSlug(pathname)
  const activeSlug = currentSlug ?? branches[0]?.slug ?? null

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-10 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div
            aria-hidden
            className="grid size-7 shrink-0 -rotate-3 place-items-center border-2 border-ink bg-red font-display text-[11px] tracking-wider text-white shadow-block-sm"
          >
            B
          </div>
          <span className="truncate font-display text-base tracking-tight text-ink group-data-[collapsible=icon]:hidden">
            {t("brand")}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {activeSlug ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {BRANCH_NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const href = `/admin/branches/${activeSlug}/${item.key}`
                  const isActive = pathname === href
                  const label = tTabs(item.key)
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={label}
                        render={
                          <Link href={href}>
                            <Icon />
                            <span>{label}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
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
