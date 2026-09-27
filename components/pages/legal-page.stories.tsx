import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { DEFAULT_BRANCH } from "@/lib/branches"
import { LegalPage } from "./legal-page"

const meta = {
  title: "Pages/LegalPage",
  component: LegalPage,
  parameters: { layout: "fullscreen" },
  args: { kind: "terms", pages: {} },
} satisfies Meta<typeof LegalPage>

export default meta

type Story = StoryObj<typeof meta>

export const DefaultTerms: Story = {}

export const DefaultAccessibility: Story = {
  args: { kind: "accessibility" },
}

export const Custom: Story = {
  args: {
    pages: {
      [DEFAULT_BRANCH]: {
        slug: DEFAULT_BRANCH,
        updatedAt: new Date("2026-09-01"),
        body: {
          he: [
            "תקנון מותאם לסניף, כפי שנערך בממשק הניהול.",
            "",
            "## הזמנות",
            "- ביטול עד 48 שעות לפני האירוע ללא חיוב.",
            "- מקדמה של 30% בעת אישור ההזמנה.",
            "",
            "## יצירת קשר",
            "טלפון: 03-0000000",
          ].join("\n"),
        },
      },
    },
  },
}
