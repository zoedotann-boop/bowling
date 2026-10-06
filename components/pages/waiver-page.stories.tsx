import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { BRANCHES, DEFAULT_BRANCH } from "@/lib/branches"
import type { SiteEventType } from "@/lib/db/queries/site"
import type { BookingFormField } from "@/lib/events/fields"

import { WaiverPage } from "./waiver-page"

const field = (
  key: string,
  type: BookingFormField["type"],
  label: string
): BookingFormField => ({
  key,
  type,
  label: { he: label },
  placeholder: null,
  options: null,
  minValue: null,
  maxValue: null,
  isRequired: true,
})

const DEFAULT_FIELDS = [
  field("firstName", "text", "שם פרטי"),
  field("lastName", "text", "שם משפחה"),
  field("idNumber", "id", "ת.ז"),
  field("phone", "tel", "טלפון"),
  field("email", "email", "אימייל"),
  field("date", "date", "תאריך"),
  { ...field("time", "time", "שעה"), placeholder: { he: "בחרו שעה" } },
]

const birthdays = {
  slug: "birthdays",
  name: { he: "ימי הולדת" },
  steps: [],
  packageLines: [],
  upgrades: [
    { label: { he: "כרטיס זמן 15 דק׳ למכונות הווידאו" }, amount: 17 },
    { label: { he: "פין באולינג מקורי" }, amount: 120 },
    { label: { he: "20 בלוני הליום" }, amount: 100 },
  ],
  formFields: [],
  content: {
    heroTitle: null,
    priceOptions: [
      {
        label: { he: "ימים א׳–ה׳" },
        days: { he: "" },
        badge: { he: "" },
        amount: 1180,
        childrenCount: null,
        extraChildAmount: null,
      },
      {
        label: { he: "סופ״ש, חגים וחוה״מ" },
        days: { he: "" },
        badge: { he: "" },
        amount: 1280,
        childrenCount: null,
        extraChildAmount: null,
      },
    ],
    priceSummaryMode: "auto",
    depositAmount: 200,
    requiresSignature: true,
  },
} as unknown as SiteEventType

const meta = {
  title: "Pages/WaiverPage",
  component: WaiverPage,
  parameters: { layout: "fullscreen" },
  args: {
    branch: BRANCHES[DEFAULT_BRANCH],
    slug: "birthdays",
    eventTypes: [birthdays],
    defaultFormFields: DEFAULT_FIELDS,
  },
} satisfies Meta<typeof WaiverPage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
}

export const MessageDefaults: Story = {
  args: { eventTypes: [] },
}
