import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

import { AdminBreadcrumbs } from "./admin-breadcrumbs"

type AdminTopbarProps = {
  slugLabels?: Record<string, string>
}

export function AdminTopbar({ slugLabels }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <AdminBreadcrumbs slugLabels={slugLabels} />
    </header>
  )
}
