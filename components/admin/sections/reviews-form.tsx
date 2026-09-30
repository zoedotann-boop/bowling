"use client"

import { RefreshCw, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTransition } from "react"

import {
  AdminCard,
  AdminField,
  AdminFlag,
  AdminInput,
} from "@/components/admin/admin-ui"
import { SectionForm, useSectionDraft } from "@/components/admin/section-form"
import { useToast } from "@/components/admin/toast"
import { Button } from "@/components/ui/button"
import {
  saveGoogleReviews,
  syncGoogleReviews,
} from "@/lib/actions/admin/google-reviews"
import type { GoogleReviewDraft } from "@/lib/actions/admin/schemas"

interface ReviewsDraft {
  slug: string
  googlePlaceId: string
  autoSync: boolean
  reviews: GoogleReviewDraft[]
}

export function ReviewsForm({
  slug,
  initial,
}: {
  slug: string
  initial: ReviewsDraft
}) {
  const t = useTranslations("admin.reviews")
  const common = useTranslations("admin.common")
  const { toast } = useToast()
  const [draft, setDraft] = useSectionDraft(initial)
  const [syncing, startSync] = useTransition()

  const hasPlaceId = Boolean(initial.googlePlaceId.trim())

  function setReviews(reviews: GoogleReviewDraft[]) {
    setDraft((prev) => ({ ...prev, reviews }))
  }

  function sync() {
    startSync(async () => {
      const result = await syncGoogleReviews({ slug })
      if (result.ok) {
        setReviews(result.reviews)
        toast(
          t("syncResult", {
            imported: result.imported,
            updated: result.updated,
          }),
          "success"
        )
        return
      }
      toast(
        result.error === "missing-place-id"
          ? t("syncMissingPlaceId")
          : result.error === "missing-key"
            ? t("syncMissingKey")
            : t("syncError"),
        "error"
      )
    })
  }

  return (
    <SectionForm
      slug={slug}
      title={t("title")}
      description={t("description")}
      draft={draft}
      onSave={(value) =>
        saveGoogleReviews({
          slug,
          googlePlaceId: value.googlePlaceId,
          autoSync: value.autoSync,
          reviews: value.reviews.map(({ id, isPublished }) => ({
            id,
            isPublished,
          })),
        })
      }
    >
      <AdminCard title={t("googleTitle")} description={t("googleDescription")}>
        <AdminField label={t("placeId")} tooltip={t("placeIdTip")}>
          <AdminInput
            dir="ltr"
            value={draft.googlePlaceId}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                googlePlaceId: event.target.value,
              }))
            }
          />
        </AdminField>

        <AdminFlag
          label={t("autoSync")}
          description={t("autoSyncTip")}
          checked={draft.autoSync}
          onCheckedChange={(autoSync) =>
            setDraft((prev) => ({ ...prev, autoSync }))
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={sync}
            disabled={syncing || !hasPlaceId}
          >
            <RefreshCw />
            {syncing ? t("syncing") : t("sync")}
          </Button>
          {!hasPlaceId && (
            <span className="text-sm text-muted-foreground">
              {t("syncMissingPlaceId")}
            </span>
          )}
        </div>
      </AdminCard>

      <AdminCard title={t("listTitle")} description={t("listDescription")}>
        {draft.reviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <ul className="space-y-3">
            {draft.reviews.map((review) => (
              <li
                key={review.id}
                className="space-y-2 rounded-md border border-border bg-background p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-sm font-medium">
                      {review.authorName}
                    </span>
                    <span
                      className="ms-2 text-sm text-marigold"
                      aria-label={t("ratingValue", { rating: review.rating })}
                    >
                      {"★".repeat(review.rating)}
                    </span>
                    <span className="ms-2 text-xs text-muted-foreground">
                      {review.publishedAt}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={common("remove")}
                    onClick={() =>
                      setReviews(
                        draft.reviews.filter((row) => row.id !== review.id)
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
                <AdminFlag
                  label={t("published")}
                  checked={review.isPublished}
                  onCheckedChange={(isPublished) =>
                    setReviews(
                      draft.reviews.map((row) =>
                        row.id === review.id ? { ...row, isPublished } : row
                      )
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </SectionForm>
  )
}
