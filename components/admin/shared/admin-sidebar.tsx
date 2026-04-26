"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  IconCalendarEvent,
  IconCheck,
  IconChevronUp,
  IconClock,
  IconFileText,
  IconInfoCircle,
  IconLayoutBottombar,
  IconLogout,
  IconPackage,
  IconPhone,
  IconPhoto,
  IconPlus,
  IconReceipt,
  IconSelector,
  IconStar,
  IconToolsKitchen2,
  IconWorld,
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

type BranchNavKey =
  | "info"
  | "hours"
  | "prices"
  | "packages"
  | "events"
  | "menu"
  | "reviews"
  | "contact"
  | "media"
  | "domains"
  | "footer"
  | "legal"

type BranchNavItem = {
  key: BranchNavKey
  icon: React.ComponentType<{ className?: string }>
}

const BRANCH_NAV_ITEMS: BranchNavItem[] = [
  { key: "info", icon: IconInfoCircle },
  { key: "hours", icon: IconClock },
  { key: "prices", icon: IconReceipt },
  { key: "packages", icon: IconPackage },
  { key: "events", icon: IconCalendarEvent },
  { key: "menu", icon: IconToolsKitchen2 },
  { key: "reviews", icon: IconStar },
  { key: "contact", icon: IconPhone },
  { key: "media", icon: IconPhoto },
  { key: "domains", icon: IconWorld },
  { key: "footer", icon: IconLayoutBottombar },
  { key: "legal", icon: IconFileText },
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
  const activeBranch = branches.find((b) => b.slug === activeSlug) ?? null

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <BranchPicker
                  branches={branches}
                  activeBranch={activeBranch}
                  currentSlug={currentSlug}
                  pathname={pathname}
                  pickerLabel={t("pickBranch")}
                  createLabel={t("createBranch")}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {activeSlug ? (
          <SidebarGroup>
            <div className="px-2 pt-1 pb-1 text-[10px] font-semibold tracking-wider text-ink-muted uppercase group-data-[collapsible=icon]:hidden">
              {t("branchGroup")}
            </div>
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

function BranchPicker({
  branches,
  activeBranch,
  currentSlug,
  pathname,
  pickerLabel,
  createLabel,
}: {
  branches: BranchOption[]
  activeBranch: BranchOption | null
  currentSlug: string | null
  pathname: string
  pickerLabel: string
  createLabel: string
}) {
  const router = useRouter()

  function handleSelect(slug: string) {
    if (currentSlug) {
      const nextPath = pathname.replace(
        /\/admin\/branches\/[^/]+/,
        `/admin/branches/${slug}`
      )
      router.push(nextPath)
    } else {
      router.push(`/admin/branches/${slug}/info`)
    }
  }

  function handleCreate() {
    router.push("/admin/branches/new")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            tooltip={activeBranch?.displayName ?? pickerLabel}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="grid size-7 shrink-0 place-items-center border-2 border-ink bg-sidebar font-display text-[11px] text-ink">
              {activeBranch
                ? activeBranch.displayName.charAt(0).toUpperCase()
                : "?"}
            </div>
            <div className="flex min-w-0 flex-1 flex-col text-start leading-tight">
              <span className="truncate text-xs font-medium text-ink">
                {activeBranch?.displayName ?? pickerLabel}
              </span>
              {activeBranch ? (
                <span className="truncate font-mono text-[11px] text-ink-muted">
                  {activeBranch.slug}
                </span>
              ) : null}
            </div>
            <IconSelector className="ms-auto size-4 shrink-0 text-ink-muted" />
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
        <DropdownMenuLabel>{pickerLabel}</DropdownMenuLabel>
        {branches.map((b) => {
          const isActive = b.slug === activeBranch?.slug
          return (
            <DropdownMenuItem key={b.slug} onClick={() => handleSelect(b.slug)}>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs font-medium text-ink">
                  {b.displayName}
                </span>
                <span className="truncate font-mono text-[11px] text-ink-muted">
                  {b.slug}
                </span>
              </div>
              {isActive ? <IconCheck className="size-4 shrink-0" /> : null}
            </DropdownMenuItem>
          )
        })}
        {branches.length > 0 ? (
          <div className="my-1 h-px bg-line" role="separator" />
        ) : null}
        <DropdownMenuItem onClick={handleCreate}>
          <IconPlus className="size-4 shrink-0" />
          <span className="text-xs font-medium text-ink">{createLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
