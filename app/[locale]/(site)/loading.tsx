import { PageShimmer } from "@/components/shimmer/page-shimmer"

export default function Loading() {
  return (
    <PageShimmer>
      <div className="flex flex-col">
        <section className="relative isolate overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
            <span className="h-6 w-40 rounded-full bg-surface" />
            <h1 className="h-12 w-3/4 rounded bg-surface" />
            <p className="h-5 w-2/3 rounded bg-surface" />
            <div className="flex gap-3">
              <span className="h-11 w-32 rounded bg-surface" />
              <span className="h-11 w-32 rounded bg-surface" />
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-lg border-2 border-ink bg-surface p-5"
              >
                <span className="size-10 rounded bg-surface" />
                <span className="h-5 w-3/4 rounded bg-surface" />
                <span className="h-4 w-full rounded bg-surface" />
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="h-7 w-48 rounded bg-surface" />
              <span className="h-4 w-72 rounded bg-surface" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg border-2 border-ink bg-surface p-5"
                >
                  <span className="h-5 w-2/3 rounded bg-surface" />
                  <span className="h-8 w-32 rounded bg-surface" />
                  <span className="h-4 w-full rounded bg-surface" />
                  <span className="h-4 w-5/6 rounded bg-surface" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <span className="h-7 w-48 rounded bg-surface" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border-2 border-ink bg-surface p-4"
                >
                  <span className="size-16 shrink-0 rounded bg-surface" />
                  <div className="flex flex-1 flex-col gap-2">
                    <span className="h-5 w-2/3 rounded bg-surface" />
                    <span className="h-4 w-full rounded bg-surface" />
                    <span className="h-4 w-1/2 rounded bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <span className="h-7 w-56 rounded bg-surface" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg border-2 border-ink bg-surface p-5"
                >
                  <span className="h-6 w-3/4 rounded bg-surface" />
                  <span className="h-4 w-full rounded bg-surface" />
                  <span className="h-4 w-5/6 rounded bg-surface" />
                  <span className="mt-2 h-9 w-32 rounded bg-surface" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <span className="h-7 w-48 rounded bg-surface" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg border-2 border-ink bg-surface p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-10 rounded-full bg-surface" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <span className="h-4 w-1/2 rounded bg-surface" />
                      <span className="h-3 w-1/3 rounded bg-surface" />
                    </div>
                  </div>
                  <span className="h-4 w-full rounded bg-surface" />
                  <span className="h-4 w-5/6 rounded bg-surface" />
                  <span className="h-4 w-3/4 rounded bg-surface" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-lg border-2 border-ink bg-surface p-6">
              <span className="h-6 w-40 rounded bg-surface" />
              <span className="h-4 w-full rounded bg-surface" />
              <span className="h-4 w-2/3 rounded bg-surface" />
              <span className="h-4 w-3/4 rounded bg-surface" />
            </div>
            <div className="h-64 rounded-lg border-2 border-ink bg-surface" />
          </div>
        </section>
      </div>
    </PageShimmer>
  )
}
