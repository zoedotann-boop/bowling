import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { DEFAULT_BRANCH } from "@/lib/branches"
import type { SiteMenu } from "@/lib/db/queries/site"
import type { MenuItemPrice } from "@/lib/menu"

import { MenuPage } from "./menu-page"

const price = (amount: number, he = "", isVisible = true): MenuItemPrice => ({
  label: { he },
  amount,
  isVisible,
})

const drink = (name: string, prices: MenuItemPrice[], description = "") => ({
  id: name,
  name: { he: name },
  description: { he: description },
  prices,
})

const sizes = (chaser: number, shot: number, bottle: number) => [
  price(chaser, "צ׳ייסר"),
  price(shot, "שוט"),
  price(bottle, "בקבוק"),
]

const menu = {
  menu: null,
  menuCategories: [
    {
      id: "alcohol",
      label: { he: "אלכוהול" },
      items: [
        drink("ערק", sizes(19, 29, 200)),
        drink("ג׳יימסון", sizes(25, 41, 430)),
        drink("בלוגה", [
          price(30, "צ׳ייסר"),
          price(48, "שוט"),
          price(600, "בקבוק", false),
        ]),
        drink("ג׳ק דניאלס", sizes(28, 44, 490), "וויסקי אמריקאי"),
      ],
    },
    {
      id: "beer",
      label: { he: "בירות" },
      items: [
        drink("קרלסברג", [price(20)]),
        drink("גולדסטאר", [price(20)]),
        drink("סטלה", [price(22, "חצי"), price(32, "שליש")]),
      ],
    },
  ],
} as unknown as SiteMenu

const meta = {
  title: "Pages/MenuPage",
  component: MenuPage,
  parameters: { layout: "fullscreen" },
  args: { menus: { [DEFAULT_BRANCH]: menu } },
} satisfies Meta<typeof MenuPage>

export default meta

type Story = StoryObj<typeof meta>

export const SeveralPricesPerDrink: Story = {}

export const MessageDefaults: Story = { args: { menus: {} } }
