import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { DEFAULT_BRANCH } from "@/lib/branches"
import type { SiteEventLocation, SiteEventType } from "@/lib/db/queries/site"
import type { EventDetailTexts } from "@/lib/events/details"
import type { BookingFormField } from "@/lib/events/fields"

import { EventDetailPage } from "./event-detail-page"

const blank = { he: "", en: "" }

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
  field("email", "email", "אימייל"),
  field("phone", "tel", "טלפון"),
  field("date", "date", "תאריך"),
  { ...field("time", "time", "שעה"), placeholder: { he: "בחרו שעה" } },
]

interface HeroAndPricing {
  heroImageUrl: string | null
  depositAmount: number | null
}

function birthdaysWith(
  texts: Partial<EventDetailTexts & HeroAndPricing>,
  upgrades: { label: { he: string }; amount: number | null }[] = []
): Partial<Record<typeof DEFAULT_BRANCH, SiteEventLocation>> {
  const type = {
    slug: "birthdays",
    name: { he: "ימי הולדת" },
    steps: [],
    packageLines: [],
    upgrades,
    formFields: [],
    content: {
      heroTitle: null,
      heroDescription: null,
      heroImageUrl: null,
      badges: null,
      depositAmount: null,
      priceNote: null,
      priceOptions: null,
      priceSummaryMode: null,
      priceSummaryRows: null,
      requiresSignature: true,
      allowedItems: null,
      forbiddenItems: null,
      rulesNote: null,
      policyItems: null,
      policyNote: null,
      formIntro: null,
      formTerms: null,
      formFootnote: null,
      upgradesTitle: null,
      upgradesNote: null,
      ...texts,
    },
  } as unknown as SiteEventType
  return {
    [DEFAULT_BRANCH]: { eventTypes: [type] } as unknown as SiteEventLocation,
  }
}

const meta = {
  title: "Pages/EventDetailPage",
  component: EventDetailPage,
  parameters: { layout: "fullscreen" },
  args: {
    slug: "birthdays",
    events: birthdaysWith({}),
    defaultFormFields: DEFAULT_FIELDS,
  },
} satisfies Meta<typeof EventDetailPage>

export default meta

type Story = StoryObj<typeof meta>

export const Defaults: Story = {}

export const CustomizedInAdmin: Story = {
  args: {
    events: birthdaysWith(
      {
        badges: [{ he: "מגיל 6+" }, { he: "עד 30 ילדים" }],
        priceNote: { he: "מינימום 15 משתתפים." },
        priceOptions: [
          {
            label: { he: "סופ״ש" },
            days: { he: "שי׳–שב׳" },
            badge: { he: "הכי מבוקש" },
            amount: 1100,
            childrenCount: 15,
            extraChildAmount: 25,
            participantsNote: { he: "עד 15 ילדים · מבוגרים חינם" },
          },
          {
            label: { he: "אמצע שבוע" },
            days: { he: "א׳–ה׳" },
            badge: blank,
            amount: 1000,
            childrenCount: 15,
            extraChildAmount: 23,
            participantsNote: blank,
          },
          {
            label: { he: "בוקר" },
            days: blank,
            badge: blank,
            amount: 900,
            childrenCount: null,
            extraChildAmount: null,
          },
        ],
        depositAmount: 200,
        priceSummaryMode: "auto",
        allowedItems: [{ he: "בלונים" }, { he: "עוגה ביתית" }],
        forbiddenItems: [{ he: "קונפטי" }],
        rulesNote: { he: "את העוגה מגישים רק בשולחן יום ההולדת." },
        policyItems: [
          {
            title: { he: "מקדמה" },
            description: { he: "300 ₪ לשריון התאריך." },
          },
          {
            title: { he: "ביטול" },
            description: { he: "עד 14 ימים לפני האירוע." },
          },
        ],
        policyNote: { he: "המדיניות מתעדכנת מעת לעת." },
        formIntro: { he: "מלאו את הפרטים ונחזור אליכם תוך יום עסקים." },
        formTerms: { he: "קראתי ואני מאשר/ת את מדיניות ההזמנה" },
        formFootnote: { he: "האירוע מאושר רק לאחר שיחה עם הצוות." },
        upgradesTitle: { he: "רוצים להוסיף משהו?" },
        upgradesNote: { he: "נציגה תחזור אליכם לתיאום התוספות." },
      },
      [
        { label: { he: "20 בלוני הליום" }, amount: 100 },
        { label: { he: "מדריך נוסף" }, amount: 150 },
        { label: { he: "צלם לאירוע" }, amount: null },
      ]
    ),
  },
}

export const ManualPriceSummary: Story = {
  args: {
    events: birthdaysWith({
      priceOptions: [
        {
          label: { he: "אמצע שבוע", en: "" },
          days: { he: "א׳–ה׳", en: "" },
          badge: blank,
          amount: 1180,
          childrenCount: 20,
          extraChildAmount: 59,
        },
      ],
      priceSummaryMode: "manual",
      priceSummaryRows: [
        { label: { he: "חבילה בסיסית · 20 ילדים" }, value: { he: "1,180 ₪" } },
        { label: { he: "כל ילד נוסף" }, value: { he: "59 ₪" } },
      ],
      depositAmount: 200,
    }),
  },
}

export const SectionsHidden: Story = {
  args: {
    events: birthdaysWith({
      badges: [],
      allowedItems: [],
      forbiddenItems: [],
      policyItems: [],
      formIntro: blank,
      formFootnote: blank,
    }),
  },
}

export const CustomHeroImage: Story = {
  args: {
    events: birthdaysWith({ heroImageUrl: "/gallery/2.png" }),
  },
}
