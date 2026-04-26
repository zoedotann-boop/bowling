import { PageShimmer } from "@/components/shimmer/page-shimmer"

export default function Loading() {
  return (
    <PageShimmer>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="h-7 w-64 rounded bg-surface" />
          <span className="h-4 w-40 rounded bg-surface" />
        </div>
        <div className="flex flex-col gap-6 rounded-lg border-2 border-ink bg-surface p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="h-4 w-28 rounded bg-surface" />
                <span className="h-10 w-full rounded bg-surface" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="h-4 w-32 rounded bg-surface" />
            <span className="h-24 w-full rounded bg-surface" />
          </div>
          <div className="flex justify-end gap-2">
            <span className="h-10 w-24 rounded bg-surface" />
            <span className="h-10 w-32 rounded bg-surface" />
          </div>
        </div>
      </div>
    </PageShimmer>
  )
}
