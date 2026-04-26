"use client"

import * as React from "react"
import { useFormatter, useTranslations } from "next-intl"
import { toast } from "sonner"

import { syncReviewsAction } from "@/app/[locale]/admin/(protected)/_actions/reviews"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type {
  ReviewCacheStatus,
  ReviewRead,
  SyncReviewsResult,
} from "@/lib/services/reviews"

type Props = {
  branchId: string
  slug: string
  googlePlaceId: string | null
  cacheStatus: ReviewCacheStatus | null
  initialReviews: ReviewRead[]
}

function Star({ filled }: { filled: boolean }) {
  return (
    <span
      aria-hidden
      className={filled ? "text-amber-500" : "text-muted-foreground/30"}
    >
      ★
    </span>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-sm">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= rating} />
      ))}
    </span>
  )
}

export function BranchReviewsForm({
  branchId,
  slug,
  googlePlaceId,
  cacheStatus,
  initialReviews,
}: Props) {
  const t = useTranslations("Admin.reviews")
  const tt = useTranslations("Admin.toasts")
  const format = useFormatter()
  const [pending, startTransition] = React.useTransition()

  function handleRefresh() {
    if (!googlePlaceId) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set("branchId", branchId)
      fd.set("slug", slug)
      const initial: FormState<SyncReviewsResult> = { status: "idle" }
      const result = await syncReviewsAction(initial, fd)
      if (result.status === "success") {
        const data = result.data
        toast.success(
          t("refreshSuccess", {
            synced: data?.synced ?? 0,
            translated: data?.translated ?? 0,
          })
        )
      } else if (result.status === "error") {
        const first = result.fieldErrors
          ? Object.values(result.fieldErrors).flat()[0]
          : undefined
        toast.error(first ?? tt("genericError"))
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 text-sm">
            <div>
              <span className="text-ink-muted">{t("placeIdLabel")}:</span>{" "}
              <code className="rounded-none bg-muted px-1 py-0.5 text-xs">
                {googlePlaceId ?? t("placeIdMissing")}
              </code>
            </div>
            {cacheStatus?.fetchedAt ? (
              <div className="text-ink-muted">
                {t("lastSynced", {
                  when: format.dateTime(new Date(cacheStatus.fetchedAt), {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                })}
              </div>
            ) : (
              <div className="text-ink-muted">{t("neverSynced")}</div>
            )}
            {cacheStatus?.averageRating != null ? (
              <div>
                {t("averageRating", {
                  rating: cacheStatus.averageRating.toFixed(1),
                  count: cacheStatus.totalRatingCount ?? 0,
                })}
              </div>
            ) : null}
          </div>
          <Button
            type="button"
            onClick={handleRefresh}
            disabled={pending || !googlePlaceId}
          >
            {pending ? t("refreshing") : t("refresh")}
          </Button>
        </CardContent>
      </Card>

      {initialReviews.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-ink-muted">
            {t("noReviews")}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {initialReviews.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">{r.authorName}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <Stars rating={r.rating} />
                    <span>
                      {format.dateTime(new Date(r.publishedAt), {
                        dateStyle: "medium",
                      })}
                    </span>
                    {r.aiTranslated ? (
                      <span className="rounded-none bg-muted px-1 py-0.5 text-[10px] tracking-wide uppercase">
                        {t("translatedBadge")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              {r.text ? (
                <CardContent className="text-sm whitespace-pre-line">
                  {r.text}
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
