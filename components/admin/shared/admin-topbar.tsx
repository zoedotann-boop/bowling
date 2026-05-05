import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdminBranchSwitcher } from "./admin-branch-switcher"

type BranchOption = {
  slug: string
  displayName: string
}

export function AdminTopbar({ branches }: { branches: BranchOption[] }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b-2 border-ink bg-cream px-4 md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <AdminBranchSwitcher branches={branches} />
    </header>
  )
}
