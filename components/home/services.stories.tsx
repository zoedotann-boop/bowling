import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { DEFAULT_BRANCH } from "@/lib/branches"
import type { SiteHomeContent } from "@/lib/db/queries/site"
import { SiteContentProvider } from "@/components/site-content-context"
import { Services } from "./services"

type ServiceRow = SiteHomeContent["services"][number]

function service(
  title: string,
  description: string,
  icon: string,
  imageUrl: string | null = null
): ServiceRow {
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    locationId: "story",
    title: { he: title },
    description: { he: description },
    icon,
    imageUrl,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  }
}

const meta = {
  title: "Home/Services",
  component: Services,
} satisfies Meta<typeof Services>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ChosenIllustrations: Story = {
  decorators: [
    (Story) => (
      <SiteContentProvider
        content={{
          [DEFAULT_BRANCH]: {
            services: [
              service(
                "באולינג",
                "מסלולי באולינג מקצועיים לכל הגילאים",
                "bowling"
              ),
              service(
                "אירועים וימי הולדת",
                "חבילות מוכנות עם מדריך צמוד",
                "party"
              ),
              service("תפריט אוכל ובר", "ארוחות, חטיפים ומבחר משקאות", "menu"),
              service("ג׳ימבורי", "ג׳ימבורי ענק שילדים אוהבים", "gymboree"),
              service(
                "משחקי ארקייד",
                "משחקי וידאו ממכרים!",
                "party",
                "/service-events.png"
              ),
            ],
          } as SiteHomeContent,
        }}
      >
        <Story />
      </SiteContentProvider>
    ),
  ],
}
