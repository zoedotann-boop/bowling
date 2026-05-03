"use client"

import * as React from "react"
import { useFormatter, useTranslations } from "next-intl"
import { toast } from "sonner"

import {
  syncReviewsAction,
  updateGooglePlaceIdAction,
} from "@/app/[locale]/admin/(protected)/_actions/reviews"
import type { FormState } from "@/app/[locale]/admin/(protected)/_actions/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  const [savingPlaceId, startSavePlaceId] = React.useTransition()
  const [placeIdInput, setPlaceIdInput] = React.useState(googlePlaceId ?? "")
  const [savedPlaceId, setSavedPlaceId] = React.useState(googlePlaceId)
  const dirty = (placeIdInput.trim() || null) !== savedPlaceId

  function handleSavePlaceId(e: React.FormEvent) {
    e.preventDefault()
    startSavePlaceId(async () => {
      const fd = new FormData()
      fd.set("id", branchId)
      const next = placeIdInput.trim()
      fd.set("googlePlaceId", next)
      const initial: FormState = { status: "idle" }
      const result = await updateGooglePlaceIdAction(initial, fd)
      if (result.status === "success") {
        setSavedPlaceId(next || null)
        toast.success(tt("branchSaved"))
      } else if (result.status === "error") {
        const first = result.fieldErrors
          ? Object.values(result.fieldErrors).flat()[0]
          : undefined
        toast.error(first ?? tt("genericError"))
      }
    })
  }

  function handleRefresh() {
    if (!savedPlaceId) return
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
        <CardContent className="flex flex-col gap-4">
          <form
            onSubmit={handleSavePlaceId}
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <Field className="flex-1">
              <label className="text-sm font-medium">{t("placeIdLabel")}</label>
              <Input
                value={placeIdInput}
                onChange={(e) => setPlaceIdInput(e.target.value)}
                placeholder="ChIJ…"
                autoComplete="off"
              />
              {!savedPlaceId ? (
                <p className="text-xs text-ink-muted">
                  {t.rich("connectHelp", {
                    link: (chunks) => (
                      <a
                        className="underline"
                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                        target="_blank"
                        rel="noopener"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                </p>
              ) : null}
            </Field>
            <Button type="submit" disabled={savingPlaceId || !dirty}>
              {savingPlaceId ? t("saving") : t("save")}
            </Button>
          </form>

          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 text-ink-muted">
              {cacheStatus?.fetchedAt ? (
                <div>
                  {t("lastSynced", {
                    when: format.dateTime(new Date(cacheStatus.fetchedAt), {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }),
                  })}
                </div>
              ) : (
                <div>{t("neverSynced")}</div>
              )}
              {cacheStatus?.averageRating != null ? (
                <div className="text-ink">
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
              disabled={pending || !savedPlaceId}
            >
              {pending ? t("refreshing") : t("refresh")}
            </Button>
          </div>
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
