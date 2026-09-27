import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { DEFAULT_BRANCH } from "@/lib/branches"
import type { SiteHomeContent } from "@/lib/db/queries/site"
import { SiteContentProvider } from "@/components/site-content-context"
import { Reviews } from "./reviews"

type GoogleReviewRow = SiteHomeContent["googleReviews"][number]

function review(
  authorName: string,
  rating: number,
  text: string
): GoogleReviewRow {
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    locationId: "story",
    externalId: authorName,
    authorName,
    rating,
    text,
    publishedAt: now,
    isPublished: true,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  }
}

function withContent(
  content: Pick<SiteHomeContent, "googlePlaceId" | "googleReviews">
) {
  return {
    [DEFAULT_BRANCH]: content as SiteHomeContent,
  }
}

const meta = {
  title: "Home/Reviews",
  component: Reviews,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Reviews>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story) => (
      <SiteContentProvider
        content={withContent({
          googlePlaceId: "ChIJReSS04BJHRURaomoKlScDjg",
          googleReviews: [
            review("תמר יוסף", 5, "הילדים ביקשו לחזור אותו השבוע. מומלץ בחום!"),
            review(
              "Dana Levi",
              5,
              "Great lanes, friendly staff and the birthday package was perfectly organized."
            ),
            review(
              "איתי בר",
              4,
              "יום הולדת מושלם לבן. ההפקה היתה חלקה והצוות מקצועי."
            ),
          ],
        })}
      >
        <Story />
      </SiteContentProvider>
    ),
  ],
}

export const Empty: Story = {}
