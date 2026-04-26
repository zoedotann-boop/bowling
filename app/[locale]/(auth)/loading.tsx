import { PageShimmer } from "@/components/shimmer/page-shimmer"

export default function Loading() {
  return (
    <PageShimmer>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col items-center gap-2">
          <span className="h-7 w-48 rounded bg-surface" />
          <span className="h-4 w-64 rounded bg-surface" />
        </header>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="h-4 w-20 rounded bg-surface" />
            <span className="h-10 w-full rounded bg-surface" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="h-4 w-24 rounded bg-surface" />
            <span className="h-10 w-full rounded bg-surface" />
          </div>
          <span className="mt-2 h-11 w-full rounded bg-surface" />
        </div>
      </div>
    </PageShimmer>
  )
}
