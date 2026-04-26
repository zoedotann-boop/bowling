import { PageShimmer } from "@/components/shimmer/page-shimmer"

export default function Loading() {
  return (
    <PageShimmer>
      <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center">
        <div className="flex w-full flex-col items-center gap-4 rounded-lg border-2 border-ink bg-surface p-8 text-center sm:p-12">
          <span className="size-12 rounded bg-surface" />
          <span className="h-7 w-40 rounded bg-surface" />
          <span className="h-4 w-56 rounded bg-surface" />
          <span className="h-9 w-32 rounded bg-surface" />
        </div>
      </div>
    </PageShimmer>
  )
}
