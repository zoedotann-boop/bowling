import { PageShimmer } from "@/components/shimmer/page-shimmer"

export default function Loading() {
  return (
    <PageShimmer>
      <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <header className="mb-10">
          <h1 className="h-10 w-3/4 rounded bg-surface" />
        </header>
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span
              key={i}
              className={`h-4 rounded bg-surface ${i % 4 === 3 ? "w-2/3" : "w-full"}`}
            />
          ))}
          <span className="mt-4 h-6 w-1/2 rounded bg-surface" />
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={`b-${i}`}
              className={`h-4 rounded bg-surface ${i % 3 === 2 ? "w-3/4" : "w-full"}`}
            />
          ))}
        </div>
      </article>
    </PageShimmer>
  )
}
